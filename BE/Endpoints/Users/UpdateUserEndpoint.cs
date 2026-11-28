using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.UseCases.Users;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Users.UpdateUser;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Extensions;

namespace LandManagement.Endpoints.Users;

public class UpdateUserEndpoint(ISender sender) : Endpoint<UpdateUserCommand, Result>
{
    public override void Configure()
    {
        Put("{id}");
        Group<UsersGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("UpdateUser").Produces<ApiResult<UserItem>>());
        Summary(s => s.Summary = "Sửa họ tên, email, vai trò (đổi vai trò thì thu hồi phiên đăng nhập)");
    }

    public override async Task HandleAsync(UpdateUserCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
