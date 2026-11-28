using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.InventoryEntries.PrefillPeriod;
using LandManagement.UseCases.InventoryEntries;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;

namespace LandManagement.Endpoints.InventoryEntries;

public class PrefillPeriodEndpoint(ISender sender) : Endpoint<PrefillPeriodCommand, Result>
{
    public override void Configure()
    {
        Post("{periodId:guid}/prefill");
        Group<InventoryPeriodsGroup>();
        Roles(nameof(UserRole.LandOfficer));
        Description(d => d.WithName("PrefillPeriod").Produces<ApiResult<PrefillResultItem>>());
        Summary(s => s.Summary = "Khởi tạo số liệu kỳ từ kỳ trước và áp biến động");
    }

    public override async Task HandleAsync(PrefillPeriodCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
