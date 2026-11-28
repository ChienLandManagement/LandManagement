using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using LandManagement.UseCases.InventoryPeriods;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.LandChanges.DeleteLandChange;

public class DeleteLandChangeHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<DeleteLandChangeCommand, ErrorOr<Success>>
{
    public async Task<ErrorOr<Success>> Handle(DeleteLandChangeCommand cmd, CancellationToken ct)
    {
        var change = await db.LandChanges.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
        var period = change is null ? null : await db.InventoryPeriods.InScope(currentUser).FirstOrDefaultAsync(x => x.Id == change.PeriodId, ct);
        if (change is null || period is null)
            return Error.NotFound("Không tìm thấy biến động".ToMessageForUser());
        if (period.Status == InventoryPeriodStatus.Locked)
            return Error.Conflict("Kỳ đã khóa, mở khóa trước khi xóa biến động".ToMessageForUser());

        db.LandChanges.Remove(change);
        await db.SaveChangesAsync(ct);
        return Result.Success;
    }
}
