using Dapper;
using Npgsql;

public sealed class CustomerService(NpgsqlDataSource dataSource)
{
    public async Task<object?> GetAllAsync()
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        var rows = await connection.QueryAsync("""
            SELECT
                c.customer_id AS "CustomerId",
                u.user_id AS "UserId",
                u.full_name AS "FullName",
                u.email AS "Email",
                u.phone AS "Phone",
                u.avatar_url AS "AvatarUrl",
                c.gender AS "Gender",
                c.date_of_birth AS "DateOfBirth",
                c.address AS "Address",
                c.loyalty_points AS "LoyaltyPoints",
                c.membership_level AS "MembershipLevel"
            FROM customers c
            JOIN users u ON c.user_id = u.user_id
            ORDER BY c.customer_id DESC;
            """);
        return rows;
    }

    public async Task<object?> GetByIdAsync(int id)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        var row = await connection.QuerySingleOrDefaultAsync("""
            SELECT
                c.customer_id AS "CustomerId",
                u.user_id AS "UserId",
                u.full_name AS "FullName",
                u.email AS "Email",
                u.phone AS "Phone",
                u.avatar_url AS "AvatarUrl",
                c.gender AS "Gender",
                c.date_of_birth AS "DateOfBirth",
                c.address AS "Address",
                c.loyalty_points AS "LoyaltyPoints",
                c.membership_level AS "MembershipLevel"
            FROM customers c
            JOIN users u ON c.user_id = u.user_id
            WHERE c.customer_id = @CustomerId;
            """, new { CustomerId = id });

        return row ?? throw new InvalidOperationException("Khong tim thay khach hang");
    }

    public async Task<object?> GetMyProfileAsync(int userId)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        var row = await connection.QuerySingleOrDefaultAsync("""
            SELECT
                u.user_id AS "UserId",
                u.full_name AS "FullName",
                u.email AS "Email",
                u.phone AS "Phone",
                u.avatar_url AS "AvatarUrl",
                u.role_id AS "RoleId",
                u.status AS "Status",
                u.is_verified AS "IsVerified",
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
            WHERE u.user_id = @UserId;
            """, new { UserId = userId });

        return row ?? throw new InvalidOperationException("Khong tim thay ho so nguoi dung");
    }

    public async Task<object?> UpdateMyProfileAsync(int userId, UpdateProfileRequest request)
    {
        var fullName = request.FullName?.Trim();
        if (string.IsNullOrWhiteSpace(fullName)) throw new InvalidOperationException("Ho ten khong duoc de trong");

        await using var connection = await dataSource.OpenConnectionAsync();
        await using var transaction = await connection.BeginTransactionAsync();
        try
        {
            await connection.ExecuteAsync("""
                UPDATE users
                SET full_name = @FullName,
                    phone = @Phone,
                    updated_at = now()
                WHERE user_id = @UserId;
                """, new { UserId = userId, FullName = fullName, Phone = EmptyToNull(request.Phone) }, transaction);

            var customerId = await connection.ExecuteScalarAsync<int?>(
                "SELECT customer_id FROM customers WHERE user_id = @UserId;",
                new { UserId = userId },
                transaction);

            if (customerId is null)
            {
                await connection.ExecuteAsync("""
                    INSERT INTO customers (user_id, gender, date_of_birth, address, loyalty_points, membership_level)
                    VALUES (@UserId, @Gender, @DateOfBirth, @Address, 0, 'Normal');
                    """,
                    new
                    {
                        UserId = userId,
                        Gender = EmptyToNull(request.Gender),
                        request.DateOfBirth,
                        Address = EmptyToNull(request.Address)
                    },
                    transaction);
            }
            else
            {
                await connection.ExecuteAsync("""
                    UPDATE customers
                    SET gender = @Gender,
                        date_of_birth = @DateOfBirth,
                        address = @Address
                    WHERE user_id = @UserId;
                    """,
                    new
                    {
                        UserId = userId,
                        Gender = EmptyToNull(request.Gender),
                        request.DateOfBirth,
                        Address = EmptyToNull(request.Address)
                    },
                    transaction);
            }

            await transaction.CommitAsync();
            return await GetMyProfileAsync(userId);
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            await transaction.RollbackAsync();
            throw new InvalidOperationException("So dien thoai da ton tai");
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<object?> UpdateMyAvatarAsync(int userId, string avatarUrl)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        await connection.ExecuteAsync("""
            UPDATE users
            SET avatar_url = @AvatarUrl,
                updated_at = now()
            WHERE user_id = @UserId;
            """, new { UserId = userId, AvatarUrl = avatarUrl });

        return await GetMyProfileAsync(userId);
    }

    public async Task<object?> CreateAsync(CreateCustomerRequest request)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        return await connection.QuerySingleAsync("""
            INSERT INTO customers (user_id, gender, date_of_birth, address)
            VALUES (@UserId, @Gender, @DateOfBirth, @Address)
            RETURNING
                customer_id AS "CustomerId",
                user_id AS "UserId",
                gender AS "Gender",
                date_of_birth AS "DateOfBirth",
                address AS "Address";
            """, request);
    }

    public async Task<object?> UpdateAsync(int id, UpdateCustomerRequest request)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        var row = await connection.QuerySingleOrDefaultAsync("""
            UPDATE customers
            SET gender = @Gender,
                date_of_birth = @DateOfBirth,
                address = @Address
            WHERE customer_id = @CustomerId
            RETURNING
                customer_id AS "CustomerId",
                user_id AS "UserId",
                gender AS "Gender",
                date_of_birth AS "DateOfBirth",
                address AS "Address";
            """, new { CustomerId = id, request.Gender, request.DateOfBirth, request.Address });

        return row ?? throw new InvalidOperationException("Khong tim thay khach hang");
    }

    public async Task<object?> RemoveAsync(int id)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        await connection.ExecuteAsync("DELETE FROM customers WHERE customer_id = @CustomerId;", new { CustomerId = id });
        return new { id };
    }

    private static string? EmptyToNull(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
