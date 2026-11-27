using LandManagement.Api.Groups;
using LandManagement.Api.UseCases.Base.Ping;
using FastEndpoints;
using MediatR;

namespace LandManagement.Api.Endpoints;

public class PingEndpoint(ISender sender) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("ping");
        Group<BaseGroup>();
        AllowAnonymous();
        Description(d => d.WithName("Ping"));
        Summary(s => s.Summary = "Ping CQRS test");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var result = await sender.Send(new PingQuery(), ct);
        if (result.IsError)
        {
            await Send.NotFoundAsync(ct);
            return;
        }
        await Send.OkAsync(new { result.Value.Message, result.Value.Timestamp }, ct);
    }
}
