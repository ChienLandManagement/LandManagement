using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.InventoryPeriods.CreatePeriod;
using LandManagement.UseCases.InventoryPeriods;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Models;

namespace LandManagement.Endpoints.InventoryPeriods;

public class CreatePeriodEndpoint(ISender sender) : Endpoint<CreatePeriodCommand, Result>
{
    public override void Configure()
    {
        Post(string.Empty);
        Group<InventoryPeriodsGroup>();
        Roles(nameof(UserRole.LandOfficer));
        Description(d => d.WithName("CreatePeriod").Produces<ApiResult<InventoryPeriodItem>>());
        Summary(s => s.Summary = "Tạo kỳ kiểm kê");
    }

    public override async Task HandleAsync(CreatePeriodCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
