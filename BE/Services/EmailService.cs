using LandManagement.Api.Options;
using LandManagement.Api.Services;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace LandManagement.Api.Services;

public class EmailService(IOptions<MailSettings> mailSettings) : IEmailService
{
    private readonly MailSettings _set = mailSettings.Value;

    public async Task SendEmailAsync(string to, string subject, string body, CancellationToken ct = default)
    {
        var msg = new MimeMessage();
        msg.From.Add(new MailboxAddress("System", _set.Username));
        msg.To.Add(MailboxAddress.Parse(to));
        msg.Subject = subject;
        msg.Body = new BodyBuilder { HtmlBody = body }.ToMessageBody();

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(_set.Host, _set.Port, SecureSocketOptions.StartTls, ct);
        if (_set.UseAuthentication) await smtp.AuthenticateAsync(_set.Username, _set.Password, ct);
        await smtp.SendAsync(msg, ct);
        await smtp.DisconnectAsync(true, ct);
    }
}
