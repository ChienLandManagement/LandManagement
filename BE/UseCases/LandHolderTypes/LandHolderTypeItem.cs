using LandManagement.Entities;

namespace LandManagement.UseCases.LandHolderTypes;

public record LandHolderTypeItem(Guid Id, string Code, string Name, Guid? ParentId, int SortOrder, string Kind)
{
    public static LandHolderTypeItem From(LandHolderType e) => new(e.Id, e.Code, e.Name, e.ParentId, e.SortOrder, e.Kind.ToString());
}
