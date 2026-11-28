using ErrorOr;
using LandManagement.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Extensions;
using ResultLib.Models;

namespace LandManagement.UseCases.Users.ListUsers;

public class ListUsersHandler(AppDbContext db) : IRequestHandler<ListUsersQuery, ErrorOr<PagedResponse<UserItem>>>
{
    public async Task<ErrorOr<PagedResponse<UserItem>>> Handle(ListUsersQuery query, CancellationToken ct)
    {
        var users = db.Users.AsNoTracking();
        if (query.Query.IsNotEmpty())
        {
            var pattern = $"%{query.Query}%";
            users = users.Where(u => EF.Functions.ILike(u.UserName, pattern)
                || EF.Functions.ILike(u.FullName, pattern)
                || (u.Email != null && EF.Functions.ILike(u.Email, pattern)));
        }
        if (query.Role is { } role) users = users.Where(u => u.Role == role);
        if (query.IsActive is { } active) users = users.Where(u => u.IsActive == active);

        var total = await users.CountAsync(ct);
        users = (query.SortBy?.ToLowerInvariant(), query.IsDescending) switch
        {
            ("fullname", false) => users.OrderBy(u => u.FullName),
            ("fullname", true) => users.OrderByDescending(u => u.FullName),
            ("createdat", false) => users.OrderBy(u => u.CreatedAt),
            ("createdat", true) => users.OrderByDescending(u => u.CreatedAt),
            (_, true) => users.OrderByDescending(u => u.UserName),
            _ => users.OrderBy(u => u.UserName)
        };
        var items = await users.Skip(query.Offset).Take(query.Limit).ToListAsync(ct);

        return PagedResponse<UserItem>.Create(items.Select(UserItem.From), total);
    }
}
