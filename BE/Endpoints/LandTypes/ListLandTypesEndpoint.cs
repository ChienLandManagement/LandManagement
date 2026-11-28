using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.LandTypes;
using LandManagement.UseCases.LandTypes.ListLandTypes;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;

namespace LandManagement.Endpoints.LandTypes;

public class ListLandTypesEndpoint(ISender sender) : Endpoint<ListLandTypesQuery, Result>
{
    public override void Configure()
    {
        Get(string.Empty);
        Group<LandTypesGroup>();
        Description(d => d.WithName("ListLandTypes").Produces<ApiResult<List<LandTypeItem>>>());
        Summary(s => s.Summary = "Danh sách loại đất (phẳng, theo thứ tự hiển thị)");
    }

    public override async Task HandleAsync(ListLandTypesQuery req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
