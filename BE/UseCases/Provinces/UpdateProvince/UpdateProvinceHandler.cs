using ErrorOr;
using LandManagement.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.Provinces.UpdateProvince;

public class UpdateProvinceHandler(AppDbContext db) : IRequestHandler<UpdateProvinceCommand, ErrorOr<ProvinceItem>>
{
    public async Task<ErrorOr<ProvinceItem>> Handle(UpdateProvinceCommand cmd, CancellationToken ct)
    {
        var province = await db.Provinces.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
        if (province is null)
            return Error.NotFound("Không tìm thấy tỉnh/thành phố".ToMessageForUser());

        var code = cmd.ProvinceCode.Trim();
        if (await db.Provinces.AnyAsync(x => x.Id != cmd.Id && x.ProvinceCode.ToLower() == code.ToLower(), ct))
            return Error.Conflict("Mã tỉnh/thành phố đã tồn tại".ToMessageForUser());

        province.ProvinceCode = code;
        province.Name = cmd.Name.Trim();
        province.ShortName = cmd.ShortName.Trim();
        province.PlaceType = cmd.PlaceType.Trim();
        province.Country = cmd.Country ?? province.Country ?? "VN";
        await db.SaveChangesAsync(ct);
        return ProvinceItem.From(province);
    }
}
