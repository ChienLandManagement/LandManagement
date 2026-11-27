namespace LandManagement.Options;

public class MailOptions
{
    public const string SectionName = "MailSettings";

    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
    public bool UseAuthentication { get; set; } = true;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string SenderName { get; set; } = "Hệ thống Quản lý Đất đai";
    public string SenderEmail { get; set; } = string.Empty;
    public bool EnableSsl { get; set; } = true;

    /// <summary>Tắt thì mọi lệnh gửi thư trả thành công mà không gửi gì (môi trường dev).</summary>
    public bool IsRunSendMail { get; set; }

    /// <summary>Bật thì mọi thư gửi về <see cref="MailTest"/> thay cho người nhận thật.</summary>
    public bool IsTestMail { get; set; }
    public string MailTest { get; set; } = string.Empty;
}
