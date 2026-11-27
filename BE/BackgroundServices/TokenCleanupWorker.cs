using ErrorOr;
using LandManagement.Data;
using Microsoft.EntityFrameworkCore;

namespace LandManagement.BackgroundServices;

/// <summary>Dọn refresh token đã hết hạn. Token đã thu hồi nhưng chưa hết hạn được giữ lại để phát hiện dùng lại.</summary>
public class TokenCleanupWorker(IConfiguration configuration, IServiceScopeFactory scopeFactory, ILogger<TokenCleanupWorker> logger)
    : PeriodicWorkerBase(configuration, scopeFactory, logger)
{
    protected override string WorkerName => "TokenCleanup";

    protected override int DefaultPollMinutes => 180;

    protected override async Task<ErrorOr<Success>> ProcessAsync(IServiceScope scope, CancellationToken ct)
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.RefreshTokens.Where(t => t.ExpiresAt < DateTime.UtcNow).ExecuteDeleteAsync(ct);
        return Result.Success;
    }
}
