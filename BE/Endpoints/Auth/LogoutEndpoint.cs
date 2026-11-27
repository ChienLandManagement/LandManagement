using FastEndpoints;
using LandManagement.Groups;
using LandManagement.UseCases.Auth;
using MediatR;
using ResultLib.Core;

namespace LandManagement.Endpoints.Auth;

public class LogoutEndpoint(ISender sender) : EndpointWithoutRequest
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
        await sender.Send(new LogoutCommand(HttpContext.GetRefreshToken()), ct);
        HttpContext.DeleteRefreshToken();
        await Send.OkAsync(Result.ResultOk, ct);
    }
}
