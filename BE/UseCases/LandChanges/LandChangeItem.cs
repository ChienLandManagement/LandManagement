using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.UseCases.InventoryEntries;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.LandChanges;

public record LandChangeItem(
    Guid Id, Guid PeriodId, DateOnly ChangeDate,
    Guid? FromLandTypeId, string? FromLandTypeCode, string? FromLandTypeName,
    Guid? ToLandTypeId, string? ToLandTypeCode, string? ToLandTypeName,
    decimal Area, Guid? HolderTypeId, string? HolderTypeName, string? Note, string Source, DateTime CreatedAt,
    LandChangeReason? Reason = null, string? ReasonText = null)
{
    public static LandChangeItem From(LandChange c) => new(
        c.Id, c.PeriodId, c.ChangeDate,
        c.FromLandTypeId, c.FromLandType?.Code, c.FromLandType?.Name,
        c.ToLandTypeId, c.ToLandType?.Code, c.ToLandType?.Name,
        c.Area, c.HolderTypeId, c.HolderType?.Name, c.Note, c.Source.ToString(), c.CreatedAt, c.Reason, c.ReasonText);
}

public static class LandChangeRules
{
    // Chỉ tăng khác / giảm khác mới có lý do; chuyển giữa hai loại đất thì bỏ.
    public static LandChangeReason? ReasonFor(Guid? fromId, Guid? toId, LandChangeReason? reason) => fromId is null || toId is null ? reason : null;

    public static string? ReasonTextFor(LandChangeReason? reason, string? text) => reason == LandChangeReason.Other ? text?.Trim() : null;

    // Loại đất phải là loại lá của Biểu 01 (không phải nhóm tổng hợp hay dòng "trong đó") để áp được vào số liệu; đối tượng phải tồn tại.
    public static async Task<ErrorOr<Success>> CheckAsync(AppDbContext db, InventoryPeriod period, DateOnly changeDate, Guid? fromId, Guid? toId, Guid? holderId, CancellationToken ct)
    {
        if (period.Status == InventoryPeriodStatus.Locked)
            return Error.Conflict("Kỳ đã khóa, mở khóa trước khi sửa biến động".ToMessageForUser());
        if (changeDate > period.CutoffDate)
            return Error.Validation("Ngày biến động không được sau ngày chốt của kỳ".ToMessageForUser());

        var tree = await CatalogTree.LoadAsync(db, ct);
        foreach (var id in new[] { fromId, toId }.OfType<Guid>().Distinct())
            if (!tree.LandTypeById.TryGetValue(id, out var type) || type.IsMemo || !tree.IsAreaLeaf(type))
                return Error.Validation("Loại đất không hợp lệ cho biến động (chọn loại đất chi tiết, không chọn dòng tổng hợp)".ToMessageForUser());

        if (holderId is { } hid && !await db.LandHolderTypes.AnyAsync(x => x.Id == hid, ct))
            return Error.NotFound("Không tìm thấy đối tượng sử dụng/quản lý".ToMessageForUser());
        return Result.Success;
    }
}
