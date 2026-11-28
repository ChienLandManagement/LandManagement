using ErrorOr;
using LandManagement.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.Wards.UpdateWard;

public class UpdateWardHandler(AppDbContext db) : IRequestHandler<UpdateWardCommand, ErrorOr<WardItem>>
{
    public async Task<ErrorOr<WardItem>> Handle(UpdateWardCommand cmd, CancellationToken ct)
    {
        var ward = await db.Wards.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
        if (ward is null)
            return Error.NotFound("Không tìm thấy xã/phường".ToMessageForUser());

        var code = cmd.WardCode.Trim();
        if (await db.Wards.AnyAsync(x => x.Id != cmd.Id && x.WardCode.ToLower() == code.ToLower(), ct))
            return Error.Conflict("Mã xã/phường đã tồn tại".ToMessageForUser());

        var province = await db.Provinces.FirstOrDefaultAsync(x => x.Id == cmd.ProvinceId, ct);
        if (province is null)
            return Error.NotFound("Không tìm thấy tỉnh/thành phố".ToMessageForUser());

        ward.WardCode = code;
        ward.Name = cmd.Name.Trim();
        ward.ProvinceId = province.Id;
        ward.Province = province;
        await db.SaveChangesAsync(ct);
        return WardItem.From(ward);
    }
}
