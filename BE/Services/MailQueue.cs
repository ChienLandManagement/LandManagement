using System.Threading.Channels;
using ErrorOr;

namespace LandManagement.Services;

public delegate Task<ErrorOr<Success>> MailJob(IEmailService email, CancellationToken ct);

// Hàng đợi trong bộ nhớ: endpoint đẩy việc gửi thư vào, SendMailWorker xả ra nên request không chờ SMTP.
public interface IMailQueue
{
    ValueTask EnqueueAsync(MailJob job);
}

public class MailQueue : IMailQueue
{
    private readonly Channel<MailJob> _channel = Channel.CreateUnbounded<MailJob>();

    public ChannelReader<MailJob> Reader => _channel.Reader;

    public ValueTask EnqueueAsync(MailJob job) => _channel.Writer.WriteAsync(job);
}
