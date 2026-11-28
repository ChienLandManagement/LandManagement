using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Wards.ListWards;
using LandManagement.UseCases.Wards;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Extensions;
using ResultLib.Models;

namespace LandManagement.Endpoints.Wards;

public class ListWardsEndpoint(ISender sender) : Endpoint<ListWardsQuery, Result>
{
    public override void Configure()
    {
        Get(string.Empty);
        Group<WardsGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("ListWards").Produces<ApiResult<PagedResponse<WardItem>>>());
        Summary(s => s.Summary = "Danh sách xã/phường (phân trang, tìm theo mã/tên)");
    }

    public override async Task HandleAsync(ListWardsQuery req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
