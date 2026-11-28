using LandManagement.Entities;
using LandManagement.Security;

namespace LandManagement.UseCases.InventoryPeriods;

public record InventoryPeriodItem(Guid Id, Guid WardId, string WardName, DateOnly CutoffDate, string Type, string Status, string? Note, int ChangeCount, DateTime CreatedAt)
{
    public static InventoryPeriodItem From(InventoryPeriod p, int changeCount) =>
        new(p.Id, p.WardId, p.Ward.Name, p.CutoffDate, p.Type.ToString(), p.Status.ToString(), p.Note, changeCount, p.CreatedAt);
}

public static class InventoryPeriodAccess
{
    // Admin thấy mọi xã; cán bộ chỉ thấy kỳ của xã mình.
    public static IQueryable<InventoryPeriod> InScope(this IQueryable<InventoryPeriod> periods, ICurrentUser user)
    {
        if (user.IsAdmin) return periods;
        var wardId = user.WardId;
        return periods.Where(x => x.WardId == wardId);
    }
}
