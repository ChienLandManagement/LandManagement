using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.LandTypes.ListLandTypes;

/// <summary>Danh mục nhỏ nên trả phẳng cả danh sách theo thứ tự hiển thị; FE tự dựng cây từ ParentId.</summary>
public record ListLandTypesQuery() : IQuery<List<LandTypeItem>>;
