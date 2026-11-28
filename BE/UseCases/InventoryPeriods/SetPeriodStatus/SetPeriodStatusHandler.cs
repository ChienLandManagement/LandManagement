using ErrorOr;
using LandManagement.Data;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.InventoryPeriods.SetPeriodStatus;

// Khóa kỳ để chốt số liệu (không sửa biến động nữa); mở khóa khi cần chỉnh.
public class SetPeriodStatusHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<SetPeriodStatusCommand, ErrorOr<InventoryPeriodItem>>
{
    public async Task<ErrorOr<InventoryPeriodItem>> Handle(SetPeriodStatusCommand cmd, CancellationToken ct)
    {
        var period = await db.InventoryPeriods.InScope(currentUser).Include(x => x.Ward).FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
        if (period is null)
            return Error.NotFound("Không tìm thấy kỳ kiểm kê".ToMessageForUser());

        period.Status = cmd.Status;
        await db.SaveChangesAsync(ct);
        return InventoryPeriodItem.From(period, await db.LandChanges.CountAsync(x => x.PeriodId == period.Id, ct));
    }
}
