namespace LandManagement.Models;

public record EmailModel(string UserName, string ResetUrl, string ExpiresAtFormatted, string AppName = EmailDefaults.AppName);

public record OtpEmailModel(string UserName, string Code, int LifetimeMinutes, string AppName = EmailDefaults.AppName);

public record WelcomeEmailModel(string FullName, string UserName, string? SetPasswordUrl, string? ExpiresAtFormatted, string AppName = EmailDefaults.AppName);

/// <summary>Thư thông báo: tiêu đề là văn bản thuần, thân tách theo dòng để template tự mã hoá HTML.</summary>
public record NoticeEmailModel(string Subject, IReadOnlyList<string> Lines, string AppName = EmailDefaults.AppName);

public static class EmailDefaults
{
    public const string AppName = "Hệ thống Quản lý Đất đai";
}
