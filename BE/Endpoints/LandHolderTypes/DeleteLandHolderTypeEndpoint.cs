using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.LandHolderTypes;
using LandManagement.UseCases.LandHolderTypes.DeleteLandHolderType;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;

namespace LandManagement.Endpoints.LandHolderTypes;

public class DeleteLandHolderTypeEndpoint(ISender sender) : Endpoint<DeleteLandHolderTypeCommand, Result>
{
    public override void Configure()
    {
        Delete("{id:guid}");
        Group<LandHolderTypesGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("DeleteLandHolderType"));
        Summary(s => s.Summary = "Xóa (mềm) đối tượng sử dụng/quản lý đất");
    }

    public override async Task HandleAsync(DeleteLandHolderTypeCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
