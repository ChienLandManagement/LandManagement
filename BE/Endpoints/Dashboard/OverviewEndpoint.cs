using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Dashboard.Overview;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;

namespace LandManagement.Endpoints.Dashboard;

public class OverviewEndpoint(ISender sender) : Endpoint<OverviewQuery, Result>
{
    public override void Configure()
    {
        Get("overview");
        Group<DashboardGroup>();
        Roles(nameof(UserRole.LandOfficer), nameof(UserRole.Leader));
        Description(d => d.WithName("GetDashboardOverview").Produces<ApiResult<OverviewItem>>());
        Summary(s => s.Summary = "Tổng quan: hồ sơ GCN, thửa thiếu thông tin, diện tích qua các kỳ");
    }

    public override async Task HandleAsync(OverviewQuery req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
