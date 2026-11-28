using FastEndpoints;
using LandManagement.Common.Models;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Provinces.UpdateProvince;
using LandManagement.UseCases.Provinces;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Extensions;

namespace LandManagement.Endpoints.Provinces;

public class UpdateProvinceEndpoint(ISender sender) : Endpoint<UpdateProvinceCommand, Result>
{
    public override void Configure()
    {
        Put("{id:guid}");
        Group<ProvincesGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("UpdateProvince").Produces<ApiResult<ProvinceItem>>());
        Summary(s => s.Summary = "Cập nhật tỉnh/thành phố");
    }

    public override async Task HandleAsync(UpdateProvinceCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
