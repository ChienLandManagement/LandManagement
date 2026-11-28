using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Dossiers;
using LandManagement.UseCases.Dossiers.SaveDossier;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Models;

namespace LandManagement.Endpoints.Dossiers;

public class UpdateDossierEndpoint(ISender sender) : Endpoint<UpdateDossierCommand, Result>
{
    public override void Configure()
    {
        Put("{id:guid}");
        Group<DossiersGroup>();
        Roles(nameof(UserRole.LandOfficer));
        Description(d => d.WithName("UpdateDossier").Produces<ApiResult<DossierItem>>());
        Summary(s => s.Summary = "Sửa hồ sơ cấp GCN");
    }

    public override async Task HandleAsync(UpdateDossierCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
