using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Wards.UpdateWard;
using LandManagement.UseCases.Wards;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Extensions;

namespace LandManagement.Endpoints.Wards;

public class UpdateWardEndpoint(ISender sender) : Endpoint<UpdateWardCommand, Result>
{
    public override void Configure()
    {
        Put("{id:guid}");
        Group<WardsGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("UpdateWard").Produces<ApiResult<WardItem>>());
        Summary(s => s.Summary = "Cập nhật xã/phường");
    }

    public override async Task HandleAsync(UpdateWardCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
