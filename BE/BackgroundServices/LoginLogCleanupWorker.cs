using ErrorOr;
using ResultLib.BackgroundServices;
using LandManagement.Data;
using Microsoft.EntityFrameworkCore;

namespace LandManagement.BackgroundServices;

/// <summary>Dọn log đăng nhập quá hạn (AuditLog:RetentionDays).</summary>
public class LoginLogCleanupWorker(IConfiguration configuration, IServiceScopeFactory scopeFactory, ILogger<LoginLogCleanupWorker> logger) : PeriodicWorkerBase(scopeFactory, logger)
{
    private readonly int _retentionDays = configuration.GetValue("AuditLog:RetentionDays", 90);

    protected override string WorkerName => "LoginLogCleanup";

    protected override bool Enabled => configuration.GetValue("IsRunWorker", false) && configuration.GetValue($"Workers:{WorkerName}:Enabled", true);

    protected override TimeSpan Interval => TimeSpan.FromMinutes(Math.Max(1, configuration.GetValue($"Workers:{WorkerName}:PollMinutes", 360)));

    protected override async Task<ErrorOr<Success>> ExecuteWorkAsync(IServiceScope scope, CancellationToken ct)
    {
        // Giá trị không hợp lệ thì bỏ qua để không xoá sạch bảng.
        if (_retentionDays <= 0) return Result.Success;

        var before = DateTime.UtcNow.AddDays(-_retentionDays);
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.LoginLogs.Where(l => l.CreatedAt < before).ExecuteDeleteAsync(ct);
        return Result.Success;
    }
}
