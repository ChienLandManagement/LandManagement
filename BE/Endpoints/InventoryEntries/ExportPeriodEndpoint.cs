using FastEndpoints;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.InventoryEntries.ExportPeriod;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;

namespace LandManagement.Endpoints.InventoryEntries;

public class ExportPeriodEndpoint(ISender sender) : Endpoint<ExportPeriodQuery, Result>
{
    private const string ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    public override void Configure()
    {
        Get("{periodId:guid}/export");
        Group<InventoryPeriodsGroup>();
        Roles(nameof(UserRole.LandOfficer), nameof(UserRole.Leader));
        Description(d => d.WithName("ExportPeriod").Produces(200, typeof(byte[]), ContentType));
        Summary(s => s.Summary = "Xuất Excel B01, B02, B04, B05 của kỳ");
    }

    public override async Task HandleAsync(ExportPeriodQuery req, CancellationToken ct)
    {
        var result = await sender.Send(req, ct);
        if (result.IsError)
        {
            await this.SendResultAsync(result.ToResult(), ct);
            return;
        }

        await Send.BytesAsync(result.Value.Content, result.Value.FileName, ContentType, cancellation: ct);
    }
}
