using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Dossiers;
using LandManagement.UseCases.Dossiers.ListDossiers;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Models;

namespace LandManagement.Endpoints.Dossiers;

public class ListDossiersEndpoint(ISender sender) : Endpoint<ListDossiersQuery, Result>
{
    public override void Configure()
    {
        Get(string.Empty);
        Group<DossiersGroup>();
        Roles(nameof(UserRole.LandOfficer), nameof(UserRole.Leader));
        Description(d => d.WithName("ListDossiers").Produces<ApiResult<PagedResponse<DossierItem>>>());
        Summary(s => s.Summary = "Danh sách hồ sơ cấp GCN");
    }

    public override async Task HandleAsync(ListDossiersQuery req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
