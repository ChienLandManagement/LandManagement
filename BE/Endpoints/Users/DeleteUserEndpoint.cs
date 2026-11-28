using FastEndpoints;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Users.DeleteUser;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Extensions;

namespace LandManagement.Endpoints.Users;

public class DeleteUserEndpoint(ISender sender) : Endpoint<DeleteUserCommand, Result>
{
    public override void Configure()
    {
        Delete("{id}");
        Group<UsersGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("DeleteUser"));
        Summary(s => s.Summary = "Xóa (mềm) tài khoản");
    }

    public override async Task HandleAsync(DeleteUserCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
