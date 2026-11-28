using ResultLib.Models;

namespace LandManagement.Entities;

public enum InventoryPeriodType { FiveYear = 1, Annual = 2 }

public enum InventoryPeriodStatus { Open = 1, Locked = 2 }

// Kỳ kiểm kê / thống kê của một xã, chốt vào CutoffDate. Biến động ghi trong kỳ là thay đổi so với kỳ trước.
public class InventoryPeriod : AuditableEntity<Guid>
{
    public InventoryPeriod() => Id = Guid.CreateVersion7();

    public Guid WardId { get; set; }
    public Ward Ward { get; set; } = null!;
    public DateOnly CutoffDate { get; set; }
    public InventoryPeriodType Type { get; set; }
    public InventoryPeriodStatus Status { get; set; } = InventoryPeriodStatus.Open;
    public string? Note { get; set; }

    public ICollection<LandChange> Changes { get; set; } = [];
}
