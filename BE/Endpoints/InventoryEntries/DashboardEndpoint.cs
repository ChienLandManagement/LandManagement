using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.InventoryEntries.Dashboard;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;

namespace LandManagement.Endpoints.InventoryEntries;

public class DashboardEndpoint(ISender sender) : Endpoint<DashboardQuery, Result>
{
    public override void Configure()
    {
        Get("{periodId:guid}/dashboard");
        Group<InventoryPeriodsGroup>();
        Roles(nameof(UserRole.LandOfficer), nameof(UserRole.Leader));
        Description(d => d.WithName("GetPeriodDashboard").Produces<ApiResult<DashboardItem>>());
        Summary(s => s.Summary = "Tổng quan kỳ: tổng diện tích, cơ cấu đất, biến động");
    }

    public override async Task HandleAsync(DashboardQuery req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
