using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.InventoryPeriods.UpdatePeriod;

public class UpdatePeriodHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<UpdatePeriodCommand, ErrorOr<InventoryPeriodItem>>
{
    public async Task<ErrorOr<InventoryPeriodItem>> Handle(UpdatePeriodCommand cmd, CancellationToken ct)
    {
        var period = await db.InventoryPeriods.InScope(currentUser).Include(x => x.Ward).FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
        if (period is null)
            return Error.NotFound("Không tìm thấy kỳ kiểm kê".ToMessageForUser());
        if (period.Status == InventoryPeriodStatus.Locked)
            return Error.Conflict("Kỳ đã khóa, mở khóa trước khi sửa".ToMessageForUser());

        if (await db.InventoryPeriods.AnyAsync(x => x.WardId == period.WardId && x.CutoffDate == cmd.CutoffDate && x.Id != period.Id, ct))
            return Error.Conflict("Xã/phường đã có kỳ chốt vào ngày này".ToMessageForUser());

        // Dời ngày chốt về trước ngày của một biến động đã ghi thì biến động đó nằm ngoài kỳ.
        if (await db.LandChanges.AnyAsync(x => x.PeriodId == period.Id && x.ChangeDate > cmd.CutoffDate, ct))
            return Error.Conflict("Có biến động ghi sau ngày chốt mới, hãy sửa các biến động đó trước".ToMessageForUser());

        period.CutoffDate = cmd.CutoffDate;
        period.Type = cmd.Type;
        period.Note = cmd.Note?.Trim();
        await db.SaveChangesAsync(ct);
        return InventoryPeriodItem.From(period, await db.LandChanges.CountAsync(x => x.PeriodId == period.Id, ct));
    }
}
