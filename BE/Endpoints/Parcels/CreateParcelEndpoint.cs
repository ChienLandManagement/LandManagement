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

public class CreateParcelEndpoint(ISender sender) : Endpoint<CreateParcelCommand, Result>
{
    public override void Configure()
    {
        Post(string.Empty);
        Group<ParcelsGroup>();
        Roles(nameof(UserRole.LandOfficer));
        Description(d => d.WithName("CreateParcel").Produces<ApiResult<ParcelItem>>());
        Summary(s => s.Summary = "Thêm thửa đất");
    }

    public override async Task HandleAsync(CreateParcelCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
