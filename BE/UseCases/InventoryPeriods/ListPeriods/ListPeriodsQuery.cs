using LandManagement.Common.Interfaces;
using ResultLib.Models;

namespace LandManagement.UseCases.InventoryPeriods.ListPeriods;

public record ListPeriodsQuery(Guid? WardId, int CurrentPage = 1, int PageSize = 20, string? SortBy = null, bool IsDescending = true, string? Query = null)
    : PaginationRequest(CurrentPage, PageSize, SortBy, IsDescending, Query), IQuery<PagedResponse<InventoryPeriodItem>>;
