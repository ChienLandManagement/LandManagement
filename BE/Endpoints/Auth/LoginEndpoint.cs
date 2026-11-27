using FastEndpoints;
using LandManagement.Configurations;
using LandManagement.Groups;
using LandManagement.UseCases.Auth;
using LandManagement.Common.Models;
using MediatR;

namespace LandManagement.Endpoints.Auth;

public record LoginRequest(string UserName, string Password);

public class LoginEndpoint(ISender sender) : Endpoint<LoginRequest>
{
    public override void Configure()
    {
        Post("login");
        Group<AuthGroup>();
        AllowAnonymous();
        Options(o => o.RequireRateLimiting(RateLimitingConfiguration.PolicyLogin));
        Description(d => d.WithName("Login").Produces<ApiResult<LoginResponse>>(200));
        Summary(s => s.Summary = "Đăng nhập bằng tên đăng nhập và mật khẩu");
    }

    public override async Task HandleAsync(LoginRequest req, CancellationToken ct)
    {
        var result = await sender.Send(new LoginCommand(req.UserName, req.Password, HttpContext.ClientIp, HttpContext.ClientUserAgent), ct);
        await HttpContext.SendAuthResultAsync(result, ct);
    }
}
