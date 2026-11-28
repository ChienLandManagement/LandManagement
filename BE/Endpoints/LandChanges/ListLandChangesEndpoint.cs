using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.LandChanges.ListLandChanges;
using LandManagement.UseCases.LandChanges;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Models;

namespace LandManagement.Endpoints.LandChanges;

public class ListLandChangesEndpoint(ISender sender) : Endpoint<ListLandChangesQuery, Result>
{
    public override void Configure()
    {
        Get(string.Empty);
        Group<LandChangesGroup>();
        Roles(nameof(UserRole.LandOfficer), nameof(UserRole.Leader));
        Description(d => d.WithName("ListLandChanges").Produces<ApiResult<PagedResponse<LandChangeItem>>>());
        Summary(s => s.Summary = "Danh sách biến động của một kỳ");
    }

    public override async Task HandleAsync(ListLandChangesQuery req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
