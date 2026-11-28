using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.InventoryPeriods.DeletePeriod;

public class DeletePeriodHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<DeletePeriodCommand, ErrorOr<Success>>
{
    public async Task<ErrorOr<Success>> Handle(DeletePeriodCommand cmd, CancellationToken ct)
    {
        var period = await db.InventoryPeriods.InScope(currentUser).FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
        if (period is null)
            return Error.NotFound("Không tìm thấy kỳ kiểm kê".ToMessageForUser());
        if (period.Status == InventoryPeriodStatus.Locked)
            return Error.Conflict("Kỳ đã khóa, mở khóa trước khi xóa".ToMessageForUser());
        if (await db.LandChanges.AnyAsync(x => x.PeriodId == period.Id, ct))
            return Error.Conflict("Không thể xóa kỳ đang có biến động".ToMessageForUser());

        db.InventoryPeriods.Remove(period);
        await db.SaveChangesAsync(ct);
        return Result.Success;
    }
}
