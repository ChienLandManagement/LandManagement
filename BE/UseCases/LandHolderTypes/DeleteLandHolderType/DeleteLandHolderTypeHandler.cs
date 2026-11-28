using ErrorOr;
using LandManagement.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.LandHolderTypes.DeleteLandHolderType;

public class DeleteLandHolderTypeHandler(AppDbContext db) : IRequestHandler<DeleteLandHolderTypeCommand, ErrorOr<Success>>
{
    public async Task<ErrorOr<Success>> Handle(DeleteLandHolderTypeCommand cmd, CancellationToken ct)
    {
        var entity = await db.LandHolderTypes.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
        if (entity is null)
            return Error.NotFound("Không tìm thấy đối tượng sử dụng/quản lý đất".ToMessageForUser());

        if (await db.LandHolderTypes.AnyAsync(x => x.ParentId == cmd.Id, ct))
            return Error.Conflict("Không thể xóa đối tượng sử dụng/quản lý đất đang có mục con".ToMessageForUser());

        db.LandHolderTypes.Remove(entity);
        await db.SaveChangesAsync(ct);
        return Result.Success;
    }
}
