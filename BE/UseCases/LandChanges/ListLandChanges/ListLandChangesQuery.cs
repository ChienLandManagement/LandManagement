using LandManagement.Common.Interfaces;
using ResultLib.Models;

namespace LandManagement.UseCases.LandChanges.ListLandChanges;

public record ListLandChangesQuery(Guid PeriodId, int CurrentPage = 1, int PageSize = 20, string? SortBy = null, bool IsDescending = true, string? Query = null)
    : PaginationRequest(CurrentPage, PageSize, SortBy, IsDescending, Query), IQuery<PagedResponse<LandChangeItem>>;
