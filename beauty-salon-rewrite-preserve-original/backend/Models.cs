public sealed record RegisterRequest(
    string? FullName,
    string? Email,
    string? Phone,
    string? Password,
    string? Gender,
    DateOnly? DateOfBirth,
    string? Address);

public sealed record VerifyEmailRequest(string? Email, string? Code);
public sealed record EmailRequest(string? Email);
public sealed record LoginRequest(string? Email, string? Password);
public sealed record GoogleLoginRequest(string? IdToken);
public sealed record ChangePasswordRequest(string? OldPassword, string? NewPassword);
public sealed record ResetPasswordRequest(string? Token, string? NewPassword);

public sealed record UpdateProfileRequest(
    string? FullName,
    string? Phone,
    string? Gender,
    DateOnly? DateOfBirth,
    string? Address);

public sealed record CreateCustomerRequest(
    int UserId,
    string? Gender,
    DateOnly? DateOfBirth,
    string? Address);

public sealed record UpdateCustomerRequest(
    string? Gender,
    DateOnly? DateOfBirth,
    string? Address);

public sealed class UserRow
{
    public int UserId { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = "";
    public int RoleId { get; set; }
    public string Status { get; set; } = "ACTIVE";
    public bool IsVerified { get; set; }
    public string? AvatarUrl { get; set; }
    public string? GoogleId { get; set; }
    public string RoleName { get; set; } = "";
    public int? CustomerId { get; set; }
    public string? Gender { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Address { get; set; }
    public int? LoyaltyPoints { get; set; }
    public string? MembershipLevel { get; set; }
}

public sealed class PendingUserRow
{
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = "";
    public string? Gender { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Address { get; set; }
    public string VerifyCode { get; set; } = "";
    public DateTime VerifyCodeExpires { get; set; }
}
