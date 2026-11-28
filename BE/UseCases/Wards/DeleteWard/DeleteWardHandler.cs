using ErrorOr;
using LandManagement.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.Wards.DeleteWard;

public class DeleteWardHandler(AppDbContext db) : IRequestHandler<DeleteWardCommand, ErrorOr<Success>>
{
    public async Task<ErrorOr<Success>> Handle(DeleteWardCommand cmd, CancellationToken ct)
    {
        var ward = await db.Wards.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
        if (ward is null)
            return Error.NotFound("Không tìm thấy xã/phường".ToMessageForUser());

        if (await db.Users.AnyAsync(x => x.Wards.Any(w => w.Id == cmd.Id), ct))
            return Error.Conflict("Không thể xóa xã/phường đang có người dùng".ToMessageForUser());

        db.Wards.Remove(ward);
        await db.SaveChangesAsync(ct);
        return Result.Success;
    }
}
