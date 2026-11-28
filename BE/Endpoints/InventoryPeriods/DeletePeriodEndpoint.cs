using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.InventoryPeriods.DeletePeriod;
using LandManagement.UseCases.InventoryPeriods;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Models;

namespace LandManagement.Endpoints.InventoryPeriods;

public class DeletePeriodEndpoint(ISender sender) : Endpoint<DeletePeriodCommand, Result>
{
    public override void Configure()
    {
        Delete("{id:guid}");
        Group<InventoryPeriodsGroup>();
        Roles(nameof(UserRole.LandOfficer));
        Description(d => d.WithName("DeletePeriod"));
        Summary(s => s.Summary = "Xóa (mềm) kỳ kiểm kê chưa có biến động");
    }

    public override async Task HandleAsync(DeletePeriodCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
