using ErrorOr;
using MediatR;

namespace LandManagement.UseCases.Base.Ping;

public class PingHandler : IRequestHandler<PingQuery, ErrorOr<PingResponse>>
{
    public Task<ErrorOr<PingResponse>> Handle(PingQuery request, CancellationToken cancellationToken)
    {
        return Task.FromResult<ErrorOr<PingResponse>>(
            new PingResponse("pong", DateTime.UtcNow));
    }
}
