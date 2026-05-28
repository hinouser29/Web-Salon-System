using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Dapper;
using Google.Apis.Auth;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

public sealed class AuthService(NpgsqlDataSource dataSource, IConfiguration config, MailService mail)
{
    public async Task<object> RegisterAsync(RegisterRequest request)
    {
        var fullName = request.FullName?.Trim();
        var email = NormalizeEmail(request.Email);
        var phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        var password = request.Password;

        if (string.IsNullOrWhiteSpace(fullName)) throw new InvalidOperationException("Ho ten khong duoc de trong");
        if (string.IsNullOrWhiteSpace(email)) throw new InvalidOperationException("Email khong duoc de trong");
        if (string.IsNullOrWhiteSpace(password) || password.Length < 6) throw new InvalidOperationException("Mat khau phai co it nhat 6 ky tu");
        if (await GetUserByEmailAsync(email) is not null) throw new InvalidOperationException("Email da ton tai");

        var verifyCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        var hash = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 10);
        await using var connection = await dataSource.OpenConnectionAsync();
        await connection.ExecuteAsync("""
            DELETE FROM pending_users WHERE email = @Email;
            INSERT INTO pending_users
                (full_name, email, phone, password_hash, gender, date_of_birth, address, verify_code, verify_code_expires)
            VALUES
                (@FullName, @Email, @Phone, @PasswordHash, @Gender, @DateOfBirth, @Address, @VerifyCode, now() + interval '10 minutes');
            """,
            new
            {
                FullName = fullName,
                Email = email,
                Phone = phone,
                PasswordHash = hash,
                request.Gender,
                request.DateOfBirth,
                request.Address,
                VerifyCode = verifyCode
            });

        var mailResult = await mail.SendVerifyEmailAsync(email, verifyCode);
        return new
        {
            message = mailResult.Skipped
                ? $"Da tao ma xac thuc DEV: {verifyCode}"
                : "Vui long kiem tra Gmail de lay ma xac thuc",
            devVerifyCode = mailResult.Skipped ? verifyCode : null
        };
    }

    public async Task<object> VerifyEmailAsync(string? email, string? code)
    {
        var normalizedEmail = NormalizeEmail(email);
        await using var connection = await dataSource.OpenConnectionAsync();
        var pending = await connection.QuerySingleOrDefaultAsync<PendingUserRow>("""
            SELECT
                full_name AS "FullName",
                email AS "Email",
                phone AS "Phone",
                password_hash AS "PasswordHash",
                gender AS "Gender",
                date_of_birth AS "DateOfBirth",
                address AS "Address",
                verify_code AS "VerifyCode",
                verify_code_expires AS "VerifyCodeExpires"
            FROM pending_users
            WHERE email = @Email
            """, new { Email = normalizedEmail });

        if (pending is null) throw new InvalidOperationException("Email khong ton tai");
        if (pending.VerifyCode != code?.Trim()) throw new InvalidOperationException("Ma xac thuc khong dung");
        if (pending.VerifyCodeExpires < DateTime.UtcNow) throw new InvalidOperationException("Ma xac thuc da het han");

        await using var transaction = await connection.BeginTransactionAsync();
        try
        {
            var userId = await connection.ExecuteScalarAsync<int>("""
                INSERT INTO users (full_name, email, phone, password_hash, role_id, status, is_verified)
                VALUES (@FullName, @Email, @Phone, @PasswordHash, 2, 'ACTIVE', true)
                RETURNING user_id;
                """, pending, transaction);

            await connection.ExecuteAsync("""
                INSERT INTO customers (user_id, gender, date_of_birth, address, loyalty_points, membership_level)
                VALUES (@UserId, @Gender, @DateOfBirth, @Address, 0, 'Normal');
                DELETE FROM pending_users WHERE email = @Email;
                """, new { UserId = userId, pending.Gender, pending.DateOfBirth, pending.Address, pending.Email }, transaction);

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        return new { message = "Xac thuc email thanh cong. Tai khoan da duoc tao" };
    }

    public async Task<object> ResendVerifyCodeAsync(string? email)
    {
        var normalizedEmail = NormalizeEmail(email);
        var verifyCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        await using var connection = await dataSource.OpenConnectionAsync();
        var affected = await connection.ExecuteAsync("""
            UPDATE pending_users
            SET verify_code = @VerifyCode,
                verify_code_expires = now() + interval '10 minutes'
            WHERE email = @Email;
            """, new { Email = normalizedEmail, VerifyCode = verifyCode });

        if (affected == 0) throw new InvalidOperationException("Email khong ton tai hoac tai khoan da duoc xac thuc");

        var mailResult = await mail.SendVerifyEmailAsync(normalizedEmail, verifyCode);
        return new
        {
            message = mailResult.Skipped ? $"Da tao ma xac thuc DEV: {verifyCode}" : "Da gui lai ma xac thuc email",
            devVerifyCode = mailResult.Skipped ? verifyCode : null
        };
    }

    public async Task<object> LoginAsync(string? email, string? password)
    {
        var user = await GetUserByEmailAsync(email);
        if (user is null) throw new InvalidOperationException("Email khong ton tai");
        if (!string.Equals(user.Status, "ACTIVE", StringComparison.OrdinalIgnoreCase)) throw new InvalidOperationException("Tai khoan da bi khoa hoac khong hoat dong");
        if (!user.IsVerified) throw new InvalidOperationException("Tai khoan chua xac thuc email");
        if (!PasswordMatches(password, user.PasswordHash)) throw new InvalidOperationException("Sai mat khau");

        return new { message = "Dang nhap thanh cong", token = CreateToken(user), user = PublicUser(user) };
    }

    public async Task<object> GoogleLoginAsync(string? idToken)
    {
        var clientId = config["Google:ClientId"];
        if (string.IsNullOrWhiteSpace(clientId)) throw new InvalidOperationException("Backend chua cau hinh GOOGLE_CLIENT_ID");
        if (string.IsNullOrWhiteSpace(idToken)) throw new InvalidOperationException("Thieu Google idToken");

        var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new[] { clientId }
        });

        var email = NormalizeEmail(payload.Email);
        var fullName = payload.Name ?? email;
        var avatarUrl = payload.Picture;
        var googleId = payload.Subject;
        await using var connection = await dataSource.OpenConnectionAsync();
        var user = await GetUserByEmailAsync(email);

        if (user is null)
        {
            await using var transaction = await connection.BeginTransactionAsync();
            try
            {
                var randomPasswordHash = BCrypt.Net.BCrypt.HashPassword(Convert.ToHexString(RandomNumberGenerator.GetBytes(24)), 10);
                var userId = await connection.ExecuteScalarAsync<int>("""
                    INSERT INTO users (full_name, email, password_hash, role_id, status, is_verified, google_id, avatar_url)
                    VALUES (@FullName, @Email, @PasswordHash, 2, 'ACTIVE', true, @GoogleId, @AvatarUrl)
                    RETURNING user_id;
                    """, new { FullName = fullName, Email = email, PasswordHash = randomPasswordHash, GoogleId = googleId, AvatarUrl = avatarUrl }, transaction);

                await connection.ExecuteAsync("""
                    INSERT INTO customers (user_id, loyalty_points, membership_level)
                    VALUES (@UserId, 0, 'Normal');
                    """, new { UserId = userId }, transaction);
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        else
        {
            await connection.ExecuteAsync("""
                UPDATE users
                SET is_verified = true,
                    google_id = @GoogleId,
                    avatar_url = COALESCE(avatar_url, @AvatarUrl),
                    updated_at = now()
                WHERE email = @Email;
                """, new { Email = email, GoogleId = googleId, AvatarUrl = avatarUrl });
        }

        user = await GetUserByEmailAsync(email) ?? throw new InvalidOperationException("Khong tim thay tai khoan");
        return new { message = "Dang nhap Google thanh cong", token = CreateToken(user), user = PublicUser(user) };
    }

    public async Task<object> ChangePasswordAsync(int userId, string? oldPassword, string? newPassword)
    {
        if (string.IsNullOrWhiteSpace(oldPassword) || string.IsNullOrWhiteSpace(newPassword)) throw new InvalidOperationException("Vui long nhap day du mat khau");
        if (newPassword.Length < 6) throw new InvalidOperationException("Mat khau moi phai co it nhat 6 ky tu");

        await using var connection = await dataSource.OpenConnectionAsync();
        var user = await connection.QuerySingleOrDefaultAsync<UserRow>("""
            SELECT user_id AS "UserId", password_hash AS "PasswordHash"
            FROM users
            WHERE user_id = @UserId
            """, new { UserId = userId });

        if (user is null) throw new InvalidOperationException("Khong tim thay tai khoan");
        if (!PasswordMatches(oldPassword, user.PasswordHash)) throw new InvalidOperationException("Mat khau hien tai khong dung");

        await connection.ExecuteAsync("""
            UPDATE users
            SET password_hash = @PasswordHash,
                updated_at = now()
            WHERE user_id = @UserId;
            """, new { UserId = userId, PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword, 10) });

        return new { message = "Doi mat khau thanh cong" };
    }

    public async Task<object> ForgotPasswordAsync(string? email)
    {
        var user = await GetUserByEmailAsync(email);
        var genericMessage = "Neu email ton tai, he thong se gui link dat lai mat khau";
        if (user is null) return new { message = genericMessage };

        var resetToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        var tokenHash = Sha256(resetToken);
        await using var connection = await dataSource.OpenConnectionAsync();
        await connection.ExecuteAsync("""
            UPDATE users
            SET reset_password_token = @TokenHash,
                reset_password_expires = now() + interval '15 minutes',
                updated_at = now()
            WHERE user_id = @UserId;
            """, new { UserId = user.UserId, TokenHash = tokenHash });

        var mailResult = await mail.SendResetPasswordEmailAsync(user.Email, resetToken);
        return new
        {
            message = mailResult.Skipped ? $"Link DEV: {(config["FrontendUrl"] ?? "http://localhost:5173").TrimEnd('/')}/reset-password?token={resetToken}" : genericMessage,
            devResetToken = mailResult.Skipped ? resetToken : null
        };
    }

    public async Task<object> ResetPasswordAsync(string? token, string? newPassword)
    {
        if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(newPassword)) throw new InvalidOperationException("Thieu token hoac mat khau moi");
        if (newPassword.Length < 6) throw new InvalidOperationException("Mat khau moi phai co it nhat 6 ky tu");

        await using var connection = await dataSource.OpenConnectionAsync();
        var userId = await connection.ExecuteScalarAsync<int?>("""
            SELECT user_id
            FROM users
            WHERE reset_password_token = @TokenHash
              AND reset_password_expires > now();
            """, new { TokenHash = Sha256(token) });

        if (userId is null) throw new InvalidOperationException("Link dat lai mat khau khong dung hoac da het han");

        await connection.ExecuteAsync("""
            UPDATE users
            SET password_hash = @PasswordHash,
                reset_password_token = null,
                reset_password_expires = null,
                updated_at = now()
            WHERE user_id = @UserId;
            """, new { UserId = userId.Value, PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword, 10) });

        return new { message = "Dat lai mat khau thanh cong" };
    }

    private async Task<UserRow?> GetUserByEmailAsync(string? email)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        return await connection.QuerySingleOrDefaultAsync<UserRow>("""
            SELECT
                u.user_id AS "UserId",
                u.full_name AS "FullName",
                u.email AS "Email",
                u.phone AS "Phone",
                u.password_hash AS "PasswordHash",
                u.role_id AS "RoleId",
                u.status AS "Status",
                u.is_verified AS "IsVerified",
                u.avatar_url AS "AvatarUrl",
                u.google_id AS "GoogleId",
                r.role_name AS "RoleName",
                c.customer_id AS "CustomerId",
                c.gender AS "Gender",
                c.date_of_birth AS "DateOfBirth",
                c.address AS "Address",
                c.loyalty_points AS "LoyaltyPoints",
                c.membership_level AS "MembershipLevel"
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN customers c ON u.user_id = c.user_id
            WHERE u.email = @Email;
            """, new { Email = NormalizeEmail(email) });
    }

    private string CreateToken(UserRow user)
    {
        var claims = new[]
        {
            new Claim("userId", user.UserId.ToString()),
            new Claim(ClaimTypes.Role, user.RoleName),
            new Claim("role", user.RoleName)
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Secret"] ?? "dev_secret_key_change_me"));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddHours(config.GetValue("Jwt:ExpiresHours", 24));

        return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
            claims: claims,
            expires: expires,
            signingCredentials: credentials));
    }

    private static object PublicUser(UserRow user) => new
    {
        user.UserId,
        user.FullName,
        user.Email,
        user.Phone,
        user.RoleId,
        user.Status,
        user.IsVerified,
        user.AvatarUrl,
        user.GoogleId,
        user.RoleName,
        user.CustomerId,
        user.Gender,
        user.DateOfBirth,
        user.Address,
        user.LoyaltyPoints,
        user.MembershipLevel
    };

    private static bool PasswordMatches(string? password, string hash)
    {
        if (password is null) return false;
        return IsBcryptHash(hash) ? BCrypt.Net.BCrypt.Verify(password, hash) : password == hash;
    }

    private static bool IsBcryptHash(string value) =>
        value.StartsWith("$2a$") || value.StartsWith("$2b$") || value.StartsWith("$2y$");

    private static string NormalizeEmail(string? email) => email?.Trim().ToLowerInvariant() ?? "";

    private static string Sha256(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
