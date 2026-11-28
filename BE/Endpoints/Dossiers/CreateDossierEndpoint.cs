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

public class CreateDossierEndpoint(ISender sender) : Endpoint<CreateDossierCommand, Result>
{
    public override void Configure()
    {
        Post(string.Empty);
        Group<DossiersGroup>();
        Roles(nameof(UserRole.LandOfficer));
        Description(d => d.WithName("CreateDossier").Produces<ApiResult<DossierItem>>());
        Summary(s => s.Summary = "Thêm hồ sơ cấp GCN");
    }

    public override async Task HandleAsync(CreateDossierCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
