using LandManagement.Common;

namespace LandManagement.Entities;

public class LoginLog : Entity<Guid>
{
    public LoginLog() => Id = Guid.CreateVersion7();

    public string UserName { get; set; } = string.Empty;
    public LoginResult Result { get; set; }
    public LoginFailReason? FailReason { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? Browser { get; set; }
    public string? Os { get; set; }
    public DeviceType DeviceType { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid? UserId { get; set; }
}

public enum LoginResult
{
    Success = 1,
    Failed = 2
}

public enum LoginFailReason
{
    UserNotFound = 1,
    WrongPassword = 2,
    Inactive = 3
}

public enum DeviceType
{
    Unknown = 0,
    Phone = 1,
    Tablet = 2,
    Desktop = 3,
    Bot = 4
}
