using LandManagement.Common.Interfaces;
using LandManagement.Entities;
using ResultLib.Models;

namespace LandManagement.UseCases.Users.ListUsers;

// Phân trang và từ khóa (Query) kế thừa PaginationRequest của ResultLib.
public record ListUsersQuery(UserRole? Role, bool? IsActive, int CurrentPage = 1, int PageSize = 20, string? SortBy = null, bool IsDescending = false, string? Query = null)
    : PaginationRequest(CurrentPage, PageSize, SortBy, IsDescending, Query), IQuery<PagedResponse<UserItem>>;
