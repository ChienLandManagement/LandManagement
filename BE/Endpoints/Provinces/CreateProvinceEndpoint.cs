using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Provinces.CreateProvince;
using LandManagement.UseCases.Provinces;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Extensions;

namespace LandManagement.Endpoints.Provinces;

public class CreateProvinceEndpoint(ISender sender) : Endpoint<CreateProvinceCommand, Result>
{
    public override void Configure()
    {
        Post(string.Empty);
        Group<ProvincesGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("CreateProvince").Produces<ApiResult<ProvinceItem>>());
        Summary(s => s.Summary = "Tạo tỉnh/thành phố");
    }

    public override async Task HandleAsync(CreateProvinceCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
