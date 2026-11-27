using LandManagement.Api.Groups;
using FastEndpoints;

namespace LandManagement.Api.Endpoints;

public class HealthEndpoint : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("health");
        Group<BaseGroup>();
        AllowAnonymous();
        Description(d => d.WithName("HealthCheck"));
        Summary(s => s.Summary = "Health check");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        await Send.OkAsync(new { status = "healthy", timestamp = DateTime.UtcNow }, ct);
    }
}
