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
}
