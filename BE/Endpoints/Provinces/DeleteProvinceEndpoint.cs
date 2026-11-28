using FastEndpoints;
using LandManagement.Entities;
using LandManagement.Groups;
using LandManagement.UseCases.Provinces.DeleteProvince;
using MediatR;
using ResultLib.Core;
using ResultLib.Extensions.FastEndpoints;
using ResultLib.Extensions;

namespace LandManagement.Endpoints.Provinces;

public class DeleteProvinceEndpoint(ISender sender) : Endpoint<DeleteProvinceCommand, Result>
{
    public override void Configure()
    {
        Delete("{id:guid}");
        Group<ProvincesGroup>();
        Roles(nameof(UserRole.Admin));
        Description(d => d.WithName("DeleteProvince"));
        Summary(s => s.Summary = "Xóa (mềm) tỉnh/thành phố");
    }

    public override async Task HandleAsync(DeleteProvinceCommand req, CancellationToken ct) =>
        await this.SendResultAsync((await sender.Send(req, ct)).ToResult(), ct);
}
