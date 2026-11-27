using ErrorOr;
using LandManagement.Common;
using LandManagement.Models;
using LandManagement.Options;
using MailKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using RazorLight;
using ResultLib.Extensions;
using ResultLib.Logging;

namespace LandManagement.Services;

public interface IEmailService
{
    Task<ErrorOr<Success>> SendResetPasswordAsync(string toEmail, string userName, string token, DateTime expiresAt, CancellationToken ct = default);
    Task<ErrorOr<Success>> SendWelcomeAsync(string toEmail, string userName, string fullName, string? token, DateTime? expiresAt, CancellationToken ct = default);
    Task<ErrorOr<Success>> SendOtpAsync(string toEmail, string userName, string code, CancellationToken ct = default);
    Task<ErrorOr<Success>> SendNoticeAsync(string toEmail, string subject, IReadOnlyList<string> lines, CancellationToken ct = default);
}

public class EmailService(IOptions<MailOptions> mailOptions, IOptions<AuthOptions> authOptions, IRazorLightEngine razor, ILogger<EmailService> logger) : IEmailService
{
    private readonly MailOptions _mail = mailOptions.Value;
    private readonly AuthOptions _auth = authOptions.Value;

    public Task<ErrorOr<Success>> SendResetPasswordAsync(string toEmail, string userName, string token, DateTime expiresAt, CancellationToken ct = default)
    {
        var url = PasswordUrl(token);
        var model = new EmailModel(userName, url, FormatTime(expiresAt));
        return SendAsync(toEmail, "Yêu cầu đặt lại mật khẩu tài khoản", TemplatePaths.Email.ForgotPassword, model, QrCodeHelper.GeneratePngBytes(url, 8), ct);
    }

    public Task<ErrorOr<Success>> SendWelcomeAsync(string toEmail, string userName, string fullName, string? token, DateTime? expiresAt, CancellationToken ct = default)
    {
        var url = token.IsEmpty() ? null : PasswordUrl(token);
        var expires = url is null ? null : FormatTime(expiresAt ?? DateTime.UtcNow.AddHours(_auth.ActivationTokenLifetimeHours));
        var model = new WelcomeEmailModel(fullName, userName, url, expires);
        return SendAsync(toEmail, $"Chào mừng bạn đến với {EmailDefaults.AppName}", TemplatePaths.Email.Welcome, model, url is null ? null : QrCodeHelper.GeneratePngBytes(url, 8), ct);
    }

    public Task<ErrorOr<Success>> SendOtpAsync(string toEmail, string userName, string code, CancellationToken ct = default) =>
        SendAsync(toEmail, "Mã xác thực đăng nhập", TemplatePaths.Email.Otp, new OtpEmailModel(userName, code, _auth.OtpLifetimeMinutes), null, ct);

    public Task<ErrorOr<Success>> SendNoticeAsync(string toEmail, string subject, IReadOnlyList<string> lines, CancellationToken ct = default) =>
        SendAsync(toEmail, subject, TemplatePaths.Email.Notice, new NoticeEmailModel(subject.ReplaceLineEndings(" ").Trim(), lines), null, ct);

    private string PasswordUrl(string token) => $"{_auth.FrontendBaseUrl.TrimEnd('/')}/dat-mat-khau?token={Uri.EscapeDataString(token)}";

    private static string FormatTime(DateTime time) => time.ToString("HH:mm:ss 'ngày' dd/MM/yyyy");

    private async Task<ErrorOr<Success>> SendAsync<T>(string toEmail, string subject, string template, T model, byte[]? qrCode, CancellationToken ct)
    {
        if (!_mail.IsRunSendMail) return Result.Success;

        var to = _mail.IsTestMail && _mail.MailTest.IsNotEmpty() ? _mail.MailTest.Trim() : toEmail.Trim();
        if (to.Length == 0) return Error.Validation("Địa chỉ email người nhận không được để trống".ToMessageForUser());

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_mail.SenderName, _mail.SenderEmail.IsEmpty() ? _mail.Username : _mail.SenderEmail));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;

            var body = new BodyBuilder { HtmlBody = await razor.CompileRenderAsync(template, model) };
            if (qrCode is { Length: > 0 }) body.LinkedResources.Add("qrcode.png", qrCode, new ContentType("image", "png")).ContentId = "qrcode-image";
            message.Body = body.ToMessageBody();

            await using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_mail.Host, _mail.Port, _mail.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto, ct);
            if (_mail.UseAuthentication && _mail.Username.IsNotEmpty()) await smtp.AuthenticateAsync(_mail.Username, _mail.Password, ct);
            await smtp.SendAsync(new SendRequest(message), ct);
            await smtp.DisconnectAsync(true, ct);
            return Result.Success;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            logger.LogError(ex, "Gửi email '{Subject}' thất bại", subject);
            return Error.Failure("Gửi email thất bại".ToMessageForUser());
        }
    }
}
