using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Parcels;
using LandManagement.UseCases.Parcels.ListParcels;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Models;

namespace LandManagement.Endpoints.Parcels;

public class ListParcelsEndpoint(ISender sender) : Endpoint<ListParcelsQuery, Result>
{
    public override void Configure()
    {
        Get(string.Empty);
        Group<ParcelsGroup>();
        Roles(nameof(UserRole.LandOfficer), nameof(UserRole.Leader));
        Description(d => d.WithName("ListParcels").Produces<ApiResult<PagedResponse<ParcelItem>>>());
        Summary(s => s.Summary = "Danh sách thửa đất");
    }

    public override async Task HandleAsync(ListParcelsQuery req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
