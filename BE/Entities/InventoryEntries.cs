namespace LandManagement.Entities;

// Số liệu hiện trạng của một kỳ, mỗi dòng là một ô lá của lưới (loại đất x đối tượng).
// Chỉ lưu ô lá; dòng cha và cột tổng tính khi xem. Ô trống hoặc 0 thì không có dòng.
public class LandAreaEntry
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid PeriodId { get; set; }
    public Guid LandTypeId { get; set; }
    public Guid HolderTypeId { get; set; }

    /// <summary>Diện tích (ha), Biểu 01.</summary>
    public decimal Area { get; set; }
}

public class LandHolderCountEntry
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid PeriodId { get; set; }
    public Guid LandTypeId { get; set; }
    public Guid HolderTypeId { get; set; }

    /// <summary>Số lượng đối tượng, Biểu 02.</summary>
    public int Count { get; set; }
}
