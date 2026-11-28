using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.LandHolderTypes;
using LandManagement.UseCases.LandHolderTypes.UpdateLandHolderType;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;

namespace LandManagement.Endpoints.LandHolderTypes;

public class UpdateLandHolderTypeEndpoint(ISender sender) : Endpoint<UpdateLandHolderTypeCommand, Result>
{
    public override void Configure()
    {
        Put("{id:guid}");
        Group<LandHolderTypesGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("UpdateLandHolderType").Produces<ApiResult<LandHolderTypeItem>>());
        Summary(s => s.Summary = "Cập nhật đối tượng sử dụng/quản lý đất");
    }

    public override async Task HandleAsync(UpdateLandHolderTypeCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
