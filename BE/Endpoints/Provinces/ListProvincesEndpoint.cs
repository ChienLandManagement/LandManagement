using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Provinces.ListProvinces;
using LandManagement.UseCases.Provinces;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Extensions;
using ResultLib.Models;

namespace LandManagement.Endpoints.Provinces;

public class ListProvincesEndpoint(ISender sender) : Endpoint<ListProvincesQuery, Result>
{
    public override void Configure()
    {
        Get(string.Empty);
        Group<ProvincesGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("ListProvinces").Produces<ApiResult<PagedResponse<ProvinceItem>>>());
        Summary(s => s.Summary = "Danh sách tỉnh/thành phố (phân trang, tìm theo mã/tên)");
    }

    public override async Task HandleAsync(ListProvincesQuery req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
