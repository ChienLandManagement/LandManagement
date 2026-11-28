using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.InventoryPeriods.SetPeriodStatus;
using LandManagement.UseCases.InventoryPeriods;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Models;

namespace LandManagement.Endpoints.InventoryPeriods;

public class SetPeriodStatusEndpoint(ISender sender) : Endpoint<SetPeriodStatusCommand, Result>
{
    public override void Configure()
    {
        Put("{id:guid}/status");
        Group<InventoryPeriodsGroup>();
        Roles(nameof(UserRole.LandOfficer));
        Description(d => d.WithName("SetPeriodStatus").Produces<ApiResult<InventoryPeriodItem>>());
        Summary(s => s.Summary = "Khóa / mở khóa kỳ kiểm kê");
    }

    public override async Task HandleAsync(SetPeriodStatusCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
