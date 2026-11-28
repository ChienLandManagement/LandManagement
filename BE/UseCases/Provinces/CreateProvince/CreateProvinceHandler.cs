using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.Provinces.CreateProvince;

public class CreateProvinceHandler(AppDbContext db) : IRequestHandler<CreateProvinceCommand, ErrorOr<ProvinceItem>>
{
    public async Task<ErrorOr<ProvinceItem>> Handle(CreateProvinceCommand cmd, CancellationToken ct)
    {
        var code = cmd.ProvinceCode.Trim();
        if (await db.Provinces.AnyAsync(x => x.ProvinceCode.ToLower() == code.ToLower(), ct))
            return Error.Conflict("Mã tỉnh/thành phố đã tồn tại".ToMessageForUser());

        var province = new Province
        {
            ProvinceCode = code,
            Name = cmd.Name.Trim(),
            ShortName = cmd.ShortName.Trim(),
            PlaceType = cmd.PlaceType.Trim(),
            Country = cmd.Country ?? "VN"
        };
        db.Provinces.Add(province);
        await db.SaveChangesAsync(ct);
        return ProvinceItem.From(province);
    }
}
