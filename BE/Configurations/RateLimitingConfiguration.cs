using System.Threading.RateLimiting;

namespace LandManagement.Configurations;

public static class RateLimitingConfiguration
{
    // Gắn lên endpoint nhạy cảm qua Options(o => o.RequireRateLimiting(...)).
    public const string PolicyLogin = "sensitive-login";
    public const string PolicyRefreshToken = "sensitive-refresh-token";

    public static IServiceCollection AddCustomRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = async (context, ct) =>
            {
                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                await context.HttpContext.Response.WriteAsJsonAsync(ResultLib.Core.Result.BadRequest("Hệ thống đang bận do nhận quá nhiều yêu cầu. Vui lòng thử lại sau giây lát."), ct);
            };

            // Đăng nhập: chống brute-force, gom theo IP để xoay tài khoản vẫn dùng chung một bucket.
            options.AddPolicy(PolicyLogin, ctx => IpPartition(ctx, PolicyLogin, permitLimit: 5, windowSeconds: 60));
            options.AddPolicy(PolicyRefreshToken, ctx => IpPartition(ctx, PolicyRefreshToken, permitLimit: 10, windowSeconds: 60));

            // Mọi request còn lại: theo người dùng đăng nhập, chưa đăng nhập thì theo IP.
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
            {
                if (ctx.Request.Path.StartsWithSegments("/api/base/health")) return RateLimitPartition.GetNoLimiter("health");

                var key = ctx.User.FindFirst("sub")?.Value ?? ClientIp(ctx);
                return RateLimitPartition.GetSlidingWindowLimiter(key, _ => new SlidingWindowRateLimiterOptions
                {
                    PermitLimit = 100,
                    Window = TimeSpan.FromSeconds(10),
                    SegmentsPerWindow = 2,
                    QueueLimit = 0
                });
            });
        });

        return services;
    }

    private static RateLimitPartition<string> IpPartition(HttpContext ctx, string policy, int permitLimit, int windowSeconds) =>
        RateLimitPartition.GetFixedWindowLimiter($"{policy}:{ClientIp(ctx)}", _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = permitLimit,
            Window = TimeSpan.FromSeconds(windowSeconds),
            QueueLimit = 0
        });

    // UseForwardedHeaders đã ghi IP thật vào Connection.RemoteIpAddress.
    internal static string ClientIp(HttpContext ctx) => ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown";
}
