using LandManagement.Common.Interfaces;
using ResultLib.Models;

namespace LandManagement.UseCases.Provinces.ListProvinces;

public record ListProvincesQuery(int CurrentPage = 1, int PageSize = 20, string? SortBy = null, bool IsDescending = false, string? Query = null)
    : PaginationRequest(CurrentPage, PageSize, SortBy, IsDescending, Query), IQuery<PagedResponse<ProvinceItem>>;
