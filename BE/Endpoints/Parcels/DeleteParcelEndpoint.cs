using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Parcels;
using LandManagement.UseCases.Parcels.DeleteParcel;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Models;

namespace LandManagement.Endpoints.Parcels;

public class DeleteParcelEndpoint(ISender sender) : Endpoint<DeleteParcelCommand, Result>
{
    public override void Configure()
    {
        Delete("{id:guid}");
        Group<ParcelsGroup>();
        Roles(nameof(UserRole.LandOfficer));
        Description(d => d.WithName("DeleteParcel"));
        Summary(s => s.Summary = "Xóa (mềm) thửa đất");
    }

    public override async Task HandleAsync(DeleteParcelCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
