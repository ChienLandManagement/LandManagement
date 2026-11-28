using ErrorOr;
using LandManagement.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.LandTypes.DeleteLandType;

public class DeleteLandTypeHandler(AppDbContext db) : IRequestHandler<DeleteLandTypeCommand, ErrorOr<Success>>
{
    public async Task<ErrorOr<Success>> Handle(DeleteLandTypeCommand cmd, CancellationToken ct)
    {
        var entity = await db.LandTypes.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
        if (entity is null)
            return Error.NotFound("Không tìm thấy loại đất".ToMessageForUser());

        if (await db.LandTypes.AnyAsync(x => x.ParentId == cmd.Id, ct))
            return Error.Conflict("Không thể xóa loại đất đang có mục con".ToMessageForUser());

        db.LandTypes.Remove(entity);
        await db.SaveChangesAsync(ct);
        return Result.Success;
    }
}
