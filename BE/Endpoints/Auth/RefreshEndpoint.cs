using FastEndpoints;
using LandManagement.Configurations;
using LandManagement.Groups;
using LandManagement.UseCases.Auth;
using LandManagement.Common.Models;
using MediatR;

namespace LandManagement.Endpoints.Auth;

public class RefreshEndpoint(ISender sender) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Post("refresh");
        Group<AuthGroup>();
        AllowAnonymous();
        Options(o => o.RequireRateLimiting(RateLimitingConfiguration.PolicyRefreshToken));
        Description(d => d.WithName("RefreshToken").Produces<ApiResult<LoginResponse>>(200));
        Summary(s => s.Summary = "Cấp access token mới từ refresh token trong cookie");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var result = await sender.Send(new RefreshCommand(HttpContext.GetRefreshToken(), HttpContext.ClientIp, HttpContext.ClientUserAgent), ct);

        if (result.IsError) HttpContext.DeleteRefreshToken();
        await HttpContext.SendAuthResultAsync(result, ct);
    }
}
