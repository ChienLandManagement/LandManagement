using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Groups;
using LandManagement.UseCases.Auth;
using LandManagement.UseCases.Auth.Me;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Extensions;

namespace LandManagement.Endpoints.Auth;

public class MeEndpoint(ISender sender) : EndpointWithoutRequest<Result>
{
    public override void Configure()
    {
        Get("me");
        Group<AuthGroup>();
        Description(d => d.WithName("Me").Produces<ApiResult<UserProfile>>());
        Summary(s => s.Summary = "Thông tin tài khoản đang đăng nhập");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            await this.SendResultAsync(Result.Unauthorized("Token không hợp lệ"), ct);
            return;
        }

        var result = (await sender.Send(new MeQuery(userId), ct)).ToResult();
        await this.SendResultAsync(result, ct);
    }
}
