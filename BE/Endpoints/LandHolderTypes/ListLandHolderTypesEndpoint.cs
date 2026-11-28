using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.LandHolderTypes;
using LandManagement.UseCases.LandHolderTypes.ListLandHolderTypes;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Extensions.FastEndpoints;

namespace LandManagement.Endpoints.LandHolderTypes;

public class ListLandHolderTypesEndpoint(ISender sender) : Endpoint<ListLandHolderTypesQuery, Result>
{
    public override void Configure()
    {
        Get(string.Empty);
        Group<LandHolderTypesGroup>();
        Description(d => d.WithName("ListLandHolderTypes").Produces<ApiResult<List<LandHolderTypeItem>>>());
        Summary(s => s.Summary = "Danh sách đối tượng sử dụng/quản lý đất (phẳng, theo thứ tự hiển thị)");
    }

    public override async Task HandleAsync(ListLandHolderTypesQuery req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
