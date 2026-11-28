using FastEndpoints;
using LandManagement.Groups;
using LandManagement.UseCases.Users.ChangeMyPassword;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Extensions;

namespace LandManagement.Endpoints.Users;

public class ChangeMyPasswordEndpoint(ISender sender) : Endpoint<ChangeMyPasswordCommand, Result>
{
    public override void Configure()
    {
        Post("me/change-password");
        Group<UsersGroup>();
        Description(d => d.WithName("ChangeMyPassword"));
        Summary(s => s.Summary = "Người dùng tự đổi mật khẩu (thu hồi phiên đăng nhập)");
    }

    public override async Task HandleAsync(ChangeMyPasswordCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
