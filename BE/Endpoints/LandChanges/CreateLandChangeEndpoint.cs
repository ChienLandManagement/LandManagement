using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.LandChanges.CreateLandChange;
using LandManagement.UseCases.LandChanges;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Models;

namespace LandManagement.Endpoints.LandChanges;

public class CreateLandChangeEndpoint(ISender sender) : Endpoint<CreateLandChangeCommand, Result>
{
    public override void Configure()
    {
        Post(string.Empty);
        Group<LandChangesGroup>();
        Roles(nameof(UserRole.LandOfficer));
        Description(d => d.WithName("CreateLandChange").Produces<ApiResult<LandChangeItem>>());
        Summary(s => s.Summary = "Ghi biến động đất đai");
    }

    public override async Task HandleAsync(CreateLandChangeCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
