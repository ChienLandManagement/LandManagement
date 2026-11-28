using LandManagement.Common.Interfaces;
using ResultLib.Models;

namespace LandManagement.UseCases.Parcels.ListParcels;

/// <summary>MissingInfo: chỉ lấy thửa còn thiếu thông tin người sử dụng.</summary>
public record ListParcelsQuery(Guid? WardId, Guid? LandTypeId, bool? MissingInfo, int CurrentPage = 1, int PageSize = 20, string? SortBy = null,
    bool IsDescending = false, string? Query = null)
    : PaginationRequest(CurrentPage, PageSize, SortBy, IsDescending, Query), IQuery<PagedResponse<ParcelItem>>;

public class ListParcelsValidator : PaginationRequestValidator<ListParcelsQuery>;
