using System.Threading.Channels;

namespace LandManagement.BackgroundServices;

/// <summary>
/// Khung chung của worker xả hàng đợi trong bộ nhớ: mỗi job một scope, lỗi một job không làm dừng worker.
/// Không kiểm cờ IsRunWorker vì hàng đợi nằm trong bộ nhớ của instance nhận request, instance đó phải tự xả.
/// </summary>
public abstract class ChannelWorkerBase<TJob>(IServiceScopeFactory scopeFactory, ILogger logger) : BackgroundService
{
    protected abstract ChannelReader<TJob> Reader { get; }

    /// <summary>Xử lý MỘT job. Ngoại lệ ném ra được base ghi log rồi đọc job kế.</summary>
    protected abstract Task HandleAsync(IServiceScope scope, TJob job, CancellationToken ct);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            await foreach (var job in Reader.ReadAllAsync(stoppingToken))
            {
                try
                {
                    using var scope = scopeFactory.CreateScope();
                    await HandleAsync(scope, job, stoppingToken);
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    logger.LogError(ex, "Ngoại lệ {Worker}", GetType().Name);
                }
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            // Ứng dụng đang tắt: job còn trong hàng đợi bị bỏ.
        }
    }
}
