using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.InventoryEntries.GetEntries;
using LandManagement.UseCases.InventoryEntries;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;

namespace LandManagement.Endpoints.InventoryEntries;

public class GetEntriesEndpoint(ISender sender) : Endpoint<GetEntriesQuery, Result>
{
    public override void Configure()
    {
        Get("{periodId:guid}/entries");
        Group<InventoryPeriodsGroup>();
        Roles(nameof(UserRole.LandOfficer), nameof(UserRole.Leader));
        Description(d => d.WithName("GetEntries").Produces<ApiResult<PeriodEntriesItem>>());
        Summary(s => s.Summary = "Số liệu B01 (diện tích) và B02 (số lượng) của kỳ, theo ô lá");
    }

    public override async Task HandleAsync(GetEntriesQuery req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
