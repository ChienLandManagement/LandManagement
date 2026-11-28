using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.InventoryPeriods.ListPeriods;
using LandManagement.UseCases.InventoryPeriods;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Models;

namespace LandManagement.Endpoints.InventoryPeriods;

public class ListPeriodsEndpoint(ISender sender) : Endpoint<ListPeriodsQuery, Result>
{
    public override void Configure()
    {
        Get(string.Empty);
        Group<InventoryPeriodsGroup>();
        Roles(nameof(UserRole.LandOfficer), nameof(UserRole.Leader));
        Description(d => d.WithName("ListPeriods").Produces<ApiResult<PagedResponse<InventoryPeriodItem>>>());
        Summary(s => s.Summary = "Danh sách kỳ kiểm kê (cán bộ xã chỉ thấy xã mình)");
    }

    public override async Task HandleAsync(ListPeriodsQuery req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
