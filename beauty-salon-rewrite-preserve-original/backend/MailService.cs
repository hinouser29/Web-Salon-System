using System.Net;
using System.Net.Mail;

public sealed class MailService(IConfiguration config)
{
    public async Task<(bool Skipped, string? Error)> SendVerifyEmailAsync(string to, string code)
    {
        var html = $"""
            <h2>Beauty Salon</h2>
            <p>Ma xac thuc cua ban la:</p>
            <h1>{WebUtility.HtmlEncode(code)}</h1>
            <p>Ma co hieu luc trong 10 phut.</p>
            """;
        return await SendAsync(to, "Beauty Salon - Ma xac thuc email", html);
    }

    public async Task<(bool Skipped, string? Error)> SendResetPasswordEmailAsync(string to, string token)
    {
        var frontendUrl = config["FrontendUrl"] ?? "http://localhost:5173";
        var link = $"{frontendUrl.TrimEnd('/')}/reset-password?token={WebUtility.UrlEncode(token)}";
        var html = $"""
            <h2>Beauty Salon</h2>
            <p>Click link duoi day de dat lai mat khau:</p>
            <p><a href="{link}">{link}</a></p>
            <p>Link co hieu luc trong 15 phut.</p>
            """;
        return await SendAsync(to, "Beauty Salon - Dat lai mat khau", html);
    }

    private async Task<(bool Skipped, string? Error)> SendAsync(string to, string subject, string html)
    {
        var username = config["Email:Username"];
        var password = config["Email:Password"];
        var from = config["Email:From"];
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            return (true, null);
        }

        using var client = new SmtpClient(config["Email:SmtpHost"] ?? "smtp.gmail.com", config.GetValue("Email:SmtpPort", 587))
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(username, password)
        };

        using var message = new MailMessage(from ?? username, to, subject, html) { IsBodyHtml = true };
        await client.SendMailAsync(message);
        return (false, null);
    }
}
