using ResultLib.Models;

namespace LandManagement.Entities;

public class User : AuditableEntity<Guid>
{
    public User() => Id = Guid.CreateVersion7();

    public string UserName { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;

    /// <summary>Các xã/phường được phân công. Admin để trống (thấy tất cả); vai trò khác phải có ít nhất một xã.</summary>
    public ICollection<Ward> Wards { get; set; } = [];
}
