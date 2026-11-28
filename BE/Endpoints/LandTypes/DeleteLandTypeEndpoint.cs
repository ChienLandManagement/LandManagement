using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.LandTypes;
using LandManagement.UseCases.LandTypes.DeleteLandType;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;

namespace LandManagement.Endpoints.LandTypes;

public class DeleteLandTypeEndpoint(ISender sender) : Endpoint<DeleteLandTypeCommand, Result>
{
    public override void Configure()
    {
        Delete("{id:guid}");
        Group<LandTypesGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("DeleteLandType"));
        Summary(s => s.Summary = "Xóa (mềm) loại đất");
    }

    public override async Task HandleAsync(DeleteLandTypeCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
