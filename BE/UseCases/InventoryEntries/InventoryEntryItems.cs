using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using LandManagement.UseCases.InventoryPeriods;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.InventoryEntries;

public record AreaCellItem(Guid LandTypeId, Guid HolderTypeId, decimal Value);

public record CountCellItem(Guid LandTypeId, Guid HolderTypeId, int Value);

public record PeriodEntriesItem(Guid PeriodId, string Status, List<AreaCellItem> Areas, List<CountCellItem> Counts);

public static class PeriodLookup
{
    // Kỳ trong phạm vi của người dùng; kỳ khóa chỉ cho đọc nên bên ghi gọi thêm RequireOpen.
    public static async Task<ErrorOr<InventoryPeriod>> FindAsync(AppDbContext db, ICurrentUser user, Guid periodId, CancellationToken ct)
    {
        var period = await db.InventoryPeriods.InScope(user).FirstOrDefaultAsync(x => x.Id == periodId, ct);
        return period is null ? Error.NotFound("Không tìm thấy kỳ kiểm kê".ToMessageForUser()) : period;
    }

    public static ErrorOr<InventoryPeriod> RequireOpen(this InventoryPeriod period) =>
        period.Status == InventoryPeriodStatus.Locked ? Error.Conflict("Kỳ đã khóa, mở khóa trước khi sửa số liệu".ToMessageForUser()) : period;
}
