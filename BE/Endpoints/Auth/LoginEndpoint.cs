using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Configurations;
using LandManagement.Groups;
using LandManagement.UseCases.Auth;
using LandManagement.UseCases.Auth.Login;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;

namespace LandManagement.Endpoints.Auth;

public class LoginEndpoint(ISender sender) : Endpoint<LoginRequest, Result>
{
    public override void Configure()
    {
        Post("login");
        Group<AuthGroup>();
        AllowAnonymous();
        Options(o => o.RequireRateLimiting(RateLimitingConfiguration.PolicyLogin));
        Description(d => d.WithName("Login").Produces<ApiResult<LoginResponse>>());
        Summary(s => s.Summary = "Đăng nhập bằng tên đăng nhập và mật khẩu");
    }

    public override async Task HandleAsync(LoginRequest req, CancellationToken ct)
    {
        var result = HttpContext.ToLoginResult(await sender.Send(new LoginCommand(req.UserName, req.Password, HttpContext.ClientIp, HttpContext.ClientUserAgent), ct));
        await this.SendResultAsync(result, ct);
    }
}
