using System.Threading.Channels;
using LandManagement.Services;

namespace LandManagement.BackgroundServices;

public class SendMailWorker(MailQueue queue, IServiceScopeFactory scopeFactory, ILogger<SendMailWorker> logger) : ChannelWorkerBase<MailJob>(scopeFactory, logger)
{
    protected override ChannelReader<MailJob> Reader => queue.Reader;

    protected override async Task HandleAsync(IServiceScope scope, MailJob job, CancellationToken ct)
    {
        var result = await job(scope.ServiceProvider.GetRequiredService<IEmailService>(), ct);
        if (result.IsError) logger.LogError("Gửi thư lỗi: {Errors}", string.Join(" | ", result.Errors.Select(e => e.Code)));
    }
}
