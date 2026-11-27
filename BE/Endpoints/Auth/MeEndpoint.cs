using FastEndpoints;
using LandManagement.Groups;
using LandManagement.UseCases.Auth;
using LandManagement.Common.Models;
using MediatR;
using ResultLib.Extensions;
using ResultLib.Core;

namespace LandManagement.Endpoints.Auth;

public class MeEndpoint(ISender sender) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("me");
        Group<AuthGroup>();
        Description(d => d.WithName("Me").Produces<ApiResult<UserProfile>>(200));
        Summary(s => s.Summary = "Thông tin tài khoản đang đăng nhập");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        if (!Guid.TryParse(User.FindFirst("sub")?.Value, out var userId))
        {
            await Send.ResponseAsync(Result.Unauthorized("Token không hợp lệ"), 401, ct);
            return;
        }

        var result = await sender.Send(new MeQuery(userId), ct);
        if (result.IsError)
        {
            var error = result.ToResult();
            await Send.ResponseAsync(error, error.StatusCode, ct);
            return;
        }

        await Send.OkAsync(Result.Ok(result.Value), ct);
    }
}
