using FastEndpoints;
using LandManagement.Common.Models;
using ResultLib.Models;
using LandManagement.UseCases.Users;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Users.ListUsers;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Extensions;

namespace LandManagement.Endpoints.Users;

public class ListUsersEndpoint(ISender sender) : Endpoint<ListUsersQuery, Result>
{
    public override void Configure()
    {
        Get(string.Empty);
        Group<UsersGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("ListUsers").Produces<ApiResult<PagedResponse<UserItem>>>());
        Summary(s => s.Summary = "Danh sách tài khoản (tìm theo từ khóa, vai trò, trạng thái; sắp xếp theo userName, fullName, createdAt; phân trang)");
    }

    public override async Task HandleAsync(ListUsersQuery req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
