using ErrorOr;
using LandManagement.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.Provinces.DeleteProvince;

public class DeleteProvinceHandler(AppDbContext db) : IRequestHandler<DeleteProvinceCommand, ErrorOr<Success>>
{
    public async Task<ErrorOr<Success>> Handle(DeleteProvinceCommand cmd, CancellationToken ct)
    {
        var province = await db.Provinces.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
        if (province is null)
            return Error.NotFound("Không tìm thấy tỉnh/thành phố".ToMessageForUser());

        if (await db.Wards.AnyAsync(x => x.ProvinceId == cmd.Id, ct))
            return Error.Conflict("Không thể xóa tỉnh/thành phố đang có xã/phường".ToMessageForUser());

        db.Provinces.Remove(province);
        await db.SaveChangesAsync(ct);
        return Result.Success;
    }
}
