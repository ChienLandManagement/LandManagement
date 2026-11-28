using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.LandChanges.UpdateLandChange;
using LandManagement.UseCases.LandChanges;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Models;

namespace LandManagement.Endpoints.LandChanges;

public class UpdateLandChangeEndpoint(ISender sender) : Endpoint<UpdateLandChangeCommand, Result>
{
    public override void Configure()
    {
        Put("{id:guid}");
        Group<LandChangesGroup>();
        Roles(nameof(UserRole.LandOfficer));
        Description(d => d.WithName("UpdateLandChange").Produces<ApiResult<LandChangeItem>>());
        Summary(s => s.Summary = "Sửa biến động");
    }

    public override async Task HandleAsync(UpdateLandChangeCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
