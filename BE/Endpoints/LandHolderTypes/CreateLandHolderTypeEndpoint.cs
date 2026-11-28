using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.LandHolderTypes;
using LandManagement.UseCases.LandHolderTypes.CreateLandHolderType;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;

namespace LandManagement.Endpoints.LandHolderTypes;

public class CreateLandHolderTypeEndpoint(ISender sender) : Endpoint<CreateLandHolderTypeCommand, Result>
{
    public override void Configure()
    {
        Post(string.Empty);
        Group<LandHolderTypesGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("CreateLandHolderType").Produces<ApiResult<LandHolderTypeItem>>());
        Summary(s => s.Summary = "Tạo đối tượng sử dụng/quản lý đất");
    }

    public override async Task HandleAsync(CreateLandHolderTypeCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
