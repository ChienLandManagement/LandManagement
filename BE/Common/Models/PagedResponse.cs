namespace LandManagement.Api.Common.Models;
public sealed class PagedResponse<T>
{
    public IReadOnlyList<T> Items { get; init; } = [];
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalItems { get; init; }
    public int TotalPages { get; init; }
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;
    public static PagedResponse<T> Create(IEnumerable<T> items, int page, int pageSize, int totalItems)
    {
        var safePage = page < 1 ? 1 : page;
        var safePageSize = pageSize < 1 ? 1 : pageSize;
        var safeTotalItems = totalItems < 0 ? 0 : totalItems;
        var totalPages = safeTotalItems == 0 ? 0 : (int)Math.Ceiling(safeTotalItems / (double)safePageSize);
        return new PagedResponse<T>
        {
            Items = items as IReadOnlyList<T> ?? items.ToList(),
            Page = safePage,
            PageSize = safePageSize,
            TotalItems = safeTotalItems,
            TotalPages = totalPages
        };
    }
}
