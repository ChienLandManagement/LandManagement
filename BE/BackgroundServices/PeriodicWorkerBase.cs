using ErrorOr;

namespace LandManagement.BackgroundServices;

/// <summary>
/// Khung chung của worker chạy định kỳ. Cờ IsRunWorker tắt thì không chạy; cấu hình riêng từng worker
/// ở "Workers:{WorkerName}" (Enabled, PollMinutes). Lượt lỗi chỉ ghi log, lượt kế vẫn chạy.
/// </summary>
public abstract class PeriodicWorkerBase(IConfiguration configuration, IServiceScopeFactory scopeFactory, ILogger logger) : BackgroundService
{
    protected abstract string WorkerName { get; }

    /// <summary>Chu kỳ mặc định (phút) khi cấu hình không khai.</summary>
    protected abstract int DefaultPollMinutes { get; }

    /// <summary>Việc của MỘT lượt.</summary>
    protected abstract Task<ErrorOr<Success>> ProcessAsync(IServiceScope scope, CancellationToken ct);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var section = configuration.GetSection($"Workers:{WorkerName}");
        if (!configuration.GetValue("IsRunWorker", false) || !section.GetValue("Enabled", true)) return;

        var poll = TimeSpan.FromMinutes(Math.Max(1, section.GetValue("PollMinutes", DefaultPollMinutes)));

        try
        {
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            using var timer = new PeriodicTimer(poll);
            do
            {
                await RunOnceAsync(stoppingToken);
            } while (await timer.WaitForNextTickAsync(stoppingToken));
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            // Ứng dụng đang tắt: thoát im lặng.
        }
    }

    private async Task RunOnceAsync(CancellationToken ct)
    {
        try
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var result = await ProcessAsync(scope, ct);
            if (result.IsError) logger.LogError("Lỗi khi chạy {Worker}: {Errors}", WorkerName, string.Join(" | ", result.Errors.Select(e => e.Code)));
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            logger.LogError(ex, "Ngoại lệ {Worker}", WorkerName);
        }
    }
}
