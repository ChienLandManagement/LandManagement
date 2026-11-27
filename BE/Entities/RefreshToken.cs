using LandManagement.Common;

namespace LandManagement.Entities;

public class RefreshToken : Entity<Guid>
{
    public RefreshToken() => Id = Guid.CreateVersion7();

    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByIp { get; set; }
    public string? Browser { get; set; }
    public string? Os { get; set; }
    public DeviceType DeviceType { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? ReplacedByHash { get; set; }

    public bool IsActive => RevokedAt is null && ExpiresAt > DateTime.UtcNow;
}
