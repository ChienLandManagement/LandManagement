using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.InventoryEntries.ImportWorkbook;
using LandManagement.UseCases.InventoryEntries;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;

namespace LandManagement.Endpoints.InventoryEntries;

public class ImportWorkbookEndpoint(ISender sender) : Endpoint<ImportWorkbookCommand, Result>
{
    public override void Configure()
    {
        Post("{periodId:guid}/import");
        Group<InventoryPeriodsGroup>();
        Roles(nameof(UserRole.LandOfficer));
        AllowFileUploads();
        Description(d => d.WithName("ImportWorkbook").Produces<ApiResult<ImportResultItem>>());
        Summary(s => s.Summary = "Nhập số liệu kỳ từ file Excel (sheet B01, B02, B05)");
    }

    public override async Task HandleAsync(ImportWorkbookCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
