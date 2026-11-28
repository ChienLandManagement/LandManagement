using LandManagement.Common.Interfaces;
using ResultLib.Models;

namespace LandManagement.UseCases.Wards.ListWards;

public record ListWardsQuery(Guid? ProvinceId, int CurrentPage = 1, int PageSize = 20, string? SortBy = null, bool IsDescending = false, string? Query = null)
    : PaginationRequest(CurrentPage, PageSize, SortBy, IsDescending, Query), IQuery<PagedResponse<WardItem>>;
