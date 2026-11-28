using ResultLib.Models;

namespace LandManagement.Entities;

// Thửa đất của một xã: tờ bản đồ + số thửa là khóa nghiệp vụ trong xã.
public class Parcel : AuditableEntity<Guid>
{
    public Parcel() => Id = Guid.CreateVersion7();

    public Guid WardId { get; set; }
    public Ward Ward { get; set; } = null!;
    public string MapSheet { get; set; } = string.Empty;
    public string ParcelNumber { get; set; } = string.Empty;
    public decimal Area { get; set; }
    public Guid LandTypeId { get; set; }
    public LandType LandType { get; set; } = null!;
    public Guid? HolderTypeId { get; set; }
    public LandHolderType? HolderType { get; set; }
    public string? HolderName { get; set; }
    public string? Address { get; set; }
    public string? Note { get; set; }
}
