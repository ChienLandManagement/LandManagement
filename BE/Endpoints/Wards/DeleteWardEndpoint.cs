using FastEndpoints;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Wards.DeleteWard;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Extensions;

namespace LandManagement.Endpoints.Wards;

public class DeleteWardEndpoint(ISender sender) : Endpoint<DeleteWardCommand, Result>
{
    public override void Configure()
    {
        Delete("{id:guid}");
        Group<WardsGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("DeleteWard"));
        Summary(s => s.Summary = "Xóa (mềm) xã/phường");
    }

    public override async Task HandleAsync(DeleteWardCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
