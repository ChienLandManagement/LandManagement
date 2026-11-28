using ResultLib.Models;

namespace LandManagement.Entities;

// Một biến động đất đai trong kỳ: Area (ha) chuyển từ loại đất From sang To.
// From = null: tăng khác (đất vào từ ngoài danh sách). To = null: giảm khác (đất ra ngoài danh sách).
public enum LandChangeSource { Manual = 1, Import = 2 }

// Lý do của tăng khác / giảm khác (đất vào ra ngoài danh sách loại đất).
public enum LandChangeReason { Remeasure = 1, CorrectError = 2, Reclamation = 3, Erosion = 4, BoundaryChange = 5, Other = 99 }

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

    /// <summary>Bắt buộc với tăng khác / giảm khác; chuyển giữa hai loại đất thì để trống.</summary>
    public LandChangeReason? Reason { get; set; }
    /// <summary>Chi tiết lý do, bắt buộc khi Reason là Other.</summary>
    public string? ReasonText { get; set; }

    /// <summary>Import: sinh ra từ Biểu 05 trong file Excel; nhập lại file thì thay các dòng này.</summary>
    public LandChangeSource Source { get; set; } = LandChangeSource.Manual;
}
