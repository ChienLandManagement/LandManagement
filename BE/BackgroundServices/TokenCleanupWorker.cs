using ErrorOr;
using ResultLib.BackgroundServices;
using LandManagement.Data;
using Microsoft.EntityFrameworkCore;

namespace LandManagement.BackgroundServices;

/// <summary>Dọn refresh token đã hết hạn. Token đã thu hồi nhưng chưa hết hạn được giữ lại để phát hiện dùng lại.</summary>
public class TokenCleanupWorker(IConfiguration configuration, IServiceScopeFactory scopeFactory, ILogger<TokenCleanupWorker> logger) : PeriodicWorkerBase(scopeFactory, logger)
{
    protected override string WorkerName => "TokenCleanup";

    protected override bool Enabled => configuration.GetValue("IsRunWorker", false) && configuration.GetValue($"Workers:{WorkerName}:Enabled", true);

    protected override TimeSpan Interval => TimeSpan.FromMinutes(Math.Max(1, configuration.GetValue($"Workers:{WorkerName}:PollMinutes", 180)));

    protected override async Task<ErrorOr<Success>> ExecuteWorkAsync(IServiceScope scope, CancellationToken ct)
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.RefreshTokens.Where(t => t.ExpiresAt < DateTime.UtcNow).ExecuteDeleteAsync(ct);
        return Result.Success;
    }
}
