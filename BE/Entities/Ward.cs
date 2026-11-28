using ResultLib.Models;

namespace LandManagement.Entities;

public class Ward : AuditableEntity<Guid>
{
    public Ward() => Id = Guid.CreateVersion7();

    public string WardCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid ProvinceId { get; set; }

    public Province Province { get; set; } = null!;
    public ICollection<User> Users { get; set; } = [];
}
