using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.LandTypes;
using LandManagement.UseCases.LandTypes.UpdateLandType;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;

namespace LandManagement.Endpoints.LandTypes;

public class UpdateLandTypeEndpoint(ISender sender) : Endpoint<UpdateLandTypeCommand, Result>
{
    public override void Configure()
    {
        Put("{id:guid}");
        Group<LandTypesGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("UpdateLandType").Produces<ApiResult<LandTypeItem>>());
        Summary(s => s.Summary = "Cập nhật loại đất");
    }

    public override async Task HandleAsync(UpdateLandTypeCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
