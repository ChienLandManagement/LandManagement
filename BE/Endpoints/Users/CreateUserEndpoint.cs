using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.UseCases.Users;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Users.CreateUser;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Extensions;

namespace LandManagement.Endpoints.Users;

public class CreateUserEndpoint(ISender sender) : Endpoint<CreateUserCommand, Result>
{
    public override void Configure()
    {
        Post(string.Empty);
        Group<UsersGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("CreateUser").Produces<ApiResult<UserItem>>());
        Summary(s => s.Summary = "Tạo tài khoản mới");
    }

    public override async Task HandleAsync(CreateUserCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
