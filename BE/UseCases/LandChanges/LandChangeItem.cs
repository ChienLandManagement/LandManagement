using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.LandChanges;

public record LandChangeItem(
    Guid Id, Guid PeriodId, DateOnly ChangeDate,
    Guid? FromLandTypeId, string? FromLandTypeCode, string? FromLandTypeName,
    Guid? ToLandTypeId, string? ToLandTypeCode, string? ToLandTypeName,
    decimal Area, Guid? HolderTypeId, string? HolderTypeName, string? Note, string Source, DateTime CreatedAt)
{
    public static LandChangeItem From(LandChange c) => new(
        c.Id, c.PeriodId, c.ChangeDate,
        c.FromLandTypeId, c.FromLandType?.Code, c.FromLandType?.Name,
        c.ToLandTypeId, c.ToLandType?.Code, c.ToLandType?.Name,
        c.Area, c.HolderTypeId, c.HolderType?.Name, c.Note, c.Source.ToString(), c.CreatedAt);
}

public static class LandChangeRules
{
    // Loại đất phải là loại có dòng ở Biểu 05 (không phải nhóm tổng hợp hay dòng "trong đó"); đối tượng phải tồn tại.
    public static async Task<ErrorOr<Success>> CheckAsync(AppDbContext db, InventoryPeriod period, DateOnly changeDate, Guid? fromId, Guid? toId, Guid? holderId, CancellationToken ct)
    {
        if (period.Status == InventoryPeriodStatus.Locked)
            return Error.Conflict("Kỳ đã khóa, mở khóa trước khi sửa biến động".ToMessageForUser());
        if (changeDate > period.CutoffDate)
            return Error.Validation("Ngày biến động không được sau ngày chốt của kỳ".ToMessageForUser());

        foreach (var id in new[] { fromId, toId }.OfType<Guid>().Distinct())
            if (!await db.LandTypes.AnyAsync(x => x.Id == id && x.InB05 && !x.IsMemo, ct))
                return Error.NotFound("Loại đất không hợp lệ cho biến động (chọn loại đất có trong Biểu 05)".ToMessageForUser());

        if (holderId is { } hid && !await db.LandHolderTypes.AnyAsync(x => x.Id == hid, ct))
            return Error.NotFound("Không tìm thấy đối tượng sử dụng/quản lý".ToMessageForUser());
        return Result.Success;
    }
}
