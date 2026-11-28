using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.InventoryPeriods.UpdatePeriod;
using LandManagement.UseCases.InventoryPeriods;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Models;

namespace LandManagement.Endpoints.InventoryPeriods;

public class UpdatePeriodEndpoint(ISender sender) : Endpoint<UpdatePeriodCommand, Result>
{
    public override void Configure()
    {
        Put("{id:guid}");
        Group<InventoryPeriodsGroup>();
        Roles(nameof(UserRole.LandOfficer));
        Description(d => d.WithName("UpdatePeriod").Produces<ApiResult<InventoryPeriodItem>>());
        Summary(s => s.Summary = "Sửa kỳ kiểm kê");
    }

    public override async Task HandleAsync(UpdatePeriodCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
