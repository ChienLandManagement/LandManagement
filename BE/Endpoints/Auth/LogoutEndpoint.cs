using FastEndpoints;
using LandManagement.Groups;
using LandManagement.UseCases.Auth.Logout;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Extensions;

namespace LandManagement.Endpoints.Auth;

public class LogoutEndpoint(ISender sender) : EndpointWithoutRequest<Result>
{
    public override void Configure()
    {
        Post("logout");
        Group<AuthGroup>();
        AllowAnonymous();
        Description(d => d.WithName("Logout"));
        Summary(s => s.Summary = "Thu hồi refresh token trong cookie và xóa cookie");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var result = (await sender.Send(new LogoutCommand(HttpContext.GetRefreshToken()), ct)).ToResult();
        HttpContext.DeleteRefreshToken();
        await this.SendResultAsync(result, ct);
    }
}
