using LandManagement.Entities;

namespace LandManagement.UseCases.LandTypes;

public record LandTypeItem(Guid Id, string Code, string Name, Guid? ParentId, int SortOrder, bool InB02, bool InB05, bool IsMemo)
{
    public static LandTypeItem From(LandType e) => new(e.Id, e.Code, e.Name, e.ParentId, e.SortOrder, e.InB02, e.InB05, e.IsMemo);
}
