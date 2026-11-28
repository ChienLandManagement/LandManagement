using System.Threading.Channels;
using ErrorOr;
using ResultLib.BackgroundServices;
using LandManagement.Services;

namespace LandManagement.BackgroundServices;

public class SendMailWorker(MailQueue queue, IServiceScopeFactory scopeFactory, ILogger<SendMailWorker> logger) : ChannelWorkerBase<MailJob>(scopeFactory, logger)
{
    protected override ChannelReader<MailJob> Reader => queue.Reader;

    protected override Task<ErrorOr<Success>> HandleJobAsync(IServiceScope scope, MailJob job, CancellationToken ct) =>
        job(scope.ServiceProvider.GetRequiredService<IEmailService>(), ct);
}
