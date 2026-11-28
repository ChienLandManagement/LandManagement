using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Configurations;
using LandManagement.Groups;
using LandManagement.UseCases.Auth;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;

namespace LandManagement.Endpoints.Auth;

public class RefreshEndpoint(ISender sender) : EndpointWithoutRequest<Result>
{
    public override void Configure()
    {
        Post("refresh");
        Group<AuthGroup>();
        AllowAnonymous();
        Options(o => o.RequireRateLimiting(RateLimitingConfiguration.PolicyRefreshToken));
        Description(d => d.WithName("RefreshToken").Produces<ApiResult<LoginResponse>>());
        Summary(s => s.Summary = "Cấp access token mới từ refresh token trong cookie");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var auth = await sender.Send(new RefreshCommand(HttpContext.GetRefreshToken(), HttpContext.ClientIp, HttpContext.ClientUserAgent), ct);
        if (auth.IsError) HttpContext.DeleteRefreshToken();

        var result = HttpContext.ToLoginResult(auth);
        await this.SendResultAsync(result, ct);
    }
}
