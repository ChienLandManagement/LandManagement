using ResultLib.Models;

namespace LandManagement.Entities;

public enum LandHolderKind
{
    User = 1,    // Người sử dụng đất
    Manager = 2  // Người được giao quản lý đất
}

// Loại đối tượng sử dụng / được giao quản lý đất: các cột của biểu 01, 02, 04.
public class LandHolderType : AuditableEntity<Guid>
{
    public LandHolderType() => Id = Guid.CreateVersion7();

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public LandHolderKind Kind { get; set; }
    public Guid? ParentId { get; set; }
    public LandHolderType? Parent { get; set; }
    public ICollection<LandHolderType> Children { get; set; } = [];
    public int SortOrder { get; set; }
}
