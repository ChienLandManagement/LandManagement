using ResultLib.Models;

namespace LandManagement.Entities;

// Một biến động đất đai trong kỳ: Area (ha) chuyển từ loại đất From sang To.
// From = null: tăng khác (đất vào từ ngoài danh sách). To = null: giảm khác (đất ra ngoài danh sách).
public class LandChange : AuditableEntity<Guid>
{
    public LandChange() => Id = Guid.CreateVersion7();

    public Guid PeriodId { get; set; }
    public InventoryPeriod Period { get; set; } = null!;
    public DateOnly ChangeDate { get; set; }
    public Guid? FromLandTypeId { get; set; }
    public LandType? FromLandType { get; set; }
    public Guid? ToLandTypeId { get; set; }
    public LandType? ToLandType { get; set; }
    public decimal Area { get; set; }
    public Guid? HolderTypeId { get; set; }
    public LandHolderType? HolderType { get; set; }
    public string? Note { get; set; }
}
