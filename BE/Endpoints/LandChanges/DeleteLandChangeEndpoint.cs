using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.LandChanges.DeleteLandChange;
using LandManagement.UseCases.LandChanges;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Models;

namespace LandManagement.Endpoints.LandChanges;

public class DeleteLandChangeEndpoint(ISender sender) : Endpoint<DeleteLandChangeCommand, Result>
{
    public override void Configure()
    {
        Delete("{id:guid}");
        Group<LandChangesGroup>();
        Roles(nameof(UserRole.LandOfficer));
        Description(d => d.WithName("DeleteLandChange"));
        Summary(s => s.Summary = "Xóa biến động");
    }

    public override async Task HandleAsync(DeleteLandChangeCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
