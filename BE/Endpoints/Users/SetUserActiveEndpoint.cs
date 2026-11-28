using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.UseCases.Users;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Users.SetUserActive;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Extensions;

namespace LandManagement.Endpoints.Users;

public class SetUserActiveEndpoint(ISender sender) : Endpoint<SetUserActiveCommand, Result>
{
    public override void Configure()
    {
        Put("{id}/active");
        Group<UsersGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("SetUserActive").Produces<ApiResult<UserItem>>());
        Summary(s => s.Summary = "Khóa hoặc mở khóa tài khoản (khóa thì thu hồi phiên đăng nhập)");
    }

    public override async Task HandleAsync(SetUserActiveCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
