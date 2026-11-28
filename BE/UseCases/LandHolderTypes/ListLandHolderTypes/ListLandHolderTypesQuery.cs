using LandManagement.Common.Interfaces;
using LandManagement.Entities;

namespace LandManagement.UseCases.LandHolderTypes.ListLandHolderTypes;

/// <summary>Danh mục nhỏ nên trả phẳng cả danh sách theo thứ tự hiển thị; FE tự dựng cây từ ParentId.</summary>
public record ListLandHolderTypesQuery(LandHolderKind? Kind = null) : IQuery<List<LandHolderTypeItem>>;
