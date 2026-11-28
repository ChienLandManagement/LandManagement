using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.InventoryEntries.CheckPeriod;
using LandManagement.UseCases.InventoryEntries;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;

namespace LandManagement.Endpoints.InventoryEntries;

public class CheckPeriodEndpoint(ISender sender) : Endpoint<CheckPeriodQuery, Result>
{
    public override void Configure()
    {
        Get("{periodId:guid}/checks");
        Group<InventoryPeriodsGroup>();
        Roles(nameof(UserRole.LandOfficer), nameof(UserRole.Leader));
        Description(d => d.WithName("CheckPeriod").Produces<ApiResult<PeriodCheckItem>>());
        Summary(s => s.Summary = "Kiểm tra số liệu kỳ: so kỳ trước cộng biến động, diện tích và số lượng");
    }

    public override async Task HandleAsync(CheckPeriodQuery req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
