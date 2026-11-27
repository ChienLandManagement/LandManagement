namespace LandManagement.Api.Options;

public class MailSettings
{
    public const string SectionName = "Mail";
    public string Host { get; set; } = null!;
    public int Port { get; set; }
    public bool UseAuthentication { get; set; }
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
}
