using ResultLib.Models;

namespace LandManagement.Entities;

// Loại đất (danh mục cây theo Thông tư 08/2024/TT-BTNMT). InB02/InB05: loại đất này có dòng ở biểu 02 / biểu 05 hay không.
public class LandType : AuditableEntity<Guid>
{
    public LandType() => Id = Guid.CreateVersion7();

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
    public LandType? Parent { get; set; }
    public ICollection<LandType> Children { get; set; } = [];
    public int SortOrder { get; set; }
    public bool InB02 { get; set; }
    public bool InB05 { get; set; }

    /// <summary>Dòng "Trong đó" (vd RSN của RSX): chỉ để theo dõi, không cộng vào tổng của mục cha.</summary>
    public bool IsMemo { get; set; }
}
