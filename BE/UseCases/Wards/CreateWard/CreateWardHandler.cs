using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.Wards.CreateWard;

public class CreateWardHandler(AppDbContext db) : IRequestHandler<CreateWardCommand, ErrorOr<WardItem>>
{
    public async Task<ErrorOr<WardItem>> Handle(CreateWardCommand cmd, CancellationToken ct)
    {
        var code = cmd.WardCode.Trim();
        if (await db.Wards.AnyAsync(x => x.WardCode.ToLower() == code.ToLower(), ct))
            return Error.Conflict("Mã xã/phường đã tồn tại".ToMessageForUser());

        var province = await db.Provinces.FirstOrDefaultAsync(x => x.Id == cmd.ProvinceId, ct);
        if (province is null)
            return Error.NotFound("Không tìm thấy tỉnh/thành phố".ToMessageForUser());

        var ward = new Ward { WardCode = code, Name = cmd.Name.Trim(), ProvinceId = province.Id, Province = province };
        db.Wards.Add(ward);
        await db.SaveChangesAsync(ct);
        return WardItem.From(ward);
    }
}
