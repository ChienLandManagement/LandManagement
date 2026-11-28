using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.InventoryEntries.SaveEntries;
using LandManagement.UseCases.InventoryEntries;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;

namespace LandManagement.Endpoints.InventoryEntries;

public class SaveEntriesEndpoint(ISender sender) : Endpoint<SaveEntriesCommand, Result>
{
    public override void Configure()
    {
        Put("{periodId:guid}/entries");
        Group<InventoryPeriodsGroup>();
        Roles(nameof(UserRole.LandOfficer));
        Description(d => d.WithName("SaveEntries").Produces<ApiResult<PeriodEntriesItem>>());
        Summary(s => s.Summary = "Lưu các ô thay đổi của lưới B01/B02 (giá trị rỗng hoặc 0 là xóa ô)");
    }

    public override async Task HandleAsync(SaveEntriesCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
