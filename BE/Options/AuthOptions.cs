namespace LandManagement.Options;

public class AuthOptions
{
    public const string SectionName = "AuthSettings";

    /// <summary>Địa chỉ gốc của FE, dùng dựng đường dẫn trong thư (đặt mật khẩu...).</summary>
    public string FrontendBaseUrl { get; set; } = "http://localhost:5173";
    public int OtpLifetimeMinutes { get; set; } = 5;
    public int ActivationTokenLifetimeHours { get; set; } = 72;
}
