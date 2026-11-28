using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Dossiers;
using LandManagement.UseCases.Dossiers.DeleteDossier;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Models;

namespace LandManagement.Endpoints.Dossiers;

public class DeleteDossierEndpoint(ISender sender) : Endpoint<DeleteDossierCommand, Result>
{
    public override void Configure()
    {
        Delete("{id:guid}");
        Group<DossiersGroup>();
        Roles(nameof(UserRole.LandOfficer));
        Description(d => d.WithName("DeleteDossier"));
        Summary(s => s.Summary = "Xóa (mềm) hồ sơ cấp GCN");
    }

    public override async Task HandleAsync(DeleteDossierCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
