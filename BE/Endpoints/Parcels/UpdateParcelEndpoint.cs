using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Parcels;
using LandManagement.UseCases.Parcels.SaveParcel;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Models;

namespace LandManagement.Endpoints.Parcels;

public class UpdateParcelEndpoint(ISender sender) : Endpoint<UpdateParcelCommand, Result>
{
    public override void Configure()
    {
        Put("{id:guid}");
        Group<ParcelsGroup>();
        Roles(nameof(UserRole.LandOfficer));
        Description(d => d.WithName("UpdateParcel").Produces<ApiResult<ParcelItem>>());
        Summary(s => s.Summary = "Sửa thửa đất");
    }

    public override async Task HandleAsync(UpdateParcelCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
