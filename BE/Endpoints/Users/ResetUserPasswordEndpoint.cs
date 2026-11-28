using FastEndpoints;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Users.ResetUserPassword;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Extensions;

namespace LandManagement.Endpoints.Users;

public class ResetUserPasswordEndpoint(ISender sender) : Endpoint<ResetUserPasswordCommand, Result>
{
    public override void Configure()
    {
        Post("{id}/reset-password");
        Group<UsersGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("ResetUserPassword"));
        Summary(s => s.Summary = "Đặt lại mật khẩu cho tài khoản (thu hồi phiên đăng nhập)");
    }

    public override async Task HandleAsync(ResetUserPasswordCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
