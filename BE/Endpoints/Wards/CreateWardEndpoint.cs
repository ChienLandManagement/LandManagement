using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Wards.CreateWard;
using LandManagement.UseCases.Wards;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Extensions;

namespace LandManagement.Endpoints.Wards;

public class CreateWardEndpoint(ISender sender) : Endpoint<CreateWardCommand, Result>
{
    public override void Configure()
    {
        Post(string.Empty);
        Group<WardsGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("CreateWard").Produces<ApiResult<WardItem>>());
        Summary(s => s.Summary = "Tạo xã/phường");
    }

    public override async Task HandleAsync(CreateWardCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
