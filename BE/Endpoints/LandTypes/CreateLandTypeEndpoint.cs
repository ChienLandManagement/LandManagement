using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.LandTypes;
using LandManagement.UseCases.LandTypes.CreateLandType;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;

namespace LandManagement.Endpoints.LandTypes;

public class CreateLandTypeEndpoint(ISender sender) : Endpoint<CreateLandTypeCommand, Result>
{
    public override void Configure()
    {
        Post(string.Empty);
        Group<LandTypesGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("CreateLandType").Produces<ApiResult<LandTypeItem>>());
        Summary(s => s.Summary = "Tạo loại đất");
    }

    public override async Task HandleAsync(CreateLandTypeCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
