using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.InventoryEntries.PrefillPeriod;

public class PrefillPeriodHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<PrefillPeriodCommand, ErrorOr<PrefillResultItem>>
{
    public async Task<ErrorOr<PrefillResultItem>> Handle(PrefillPeriodCommand cmd, CancellationToken ct)
    {
        var found = await PeriodLookup.FindAsync(db, currentUser, cmd.PeriodId, ct);
        if (found.IsError) return found.Errors;
        var open = found.Value.RequireOpen();
        if (open.IsError) return open.Errors;
        var period = found.Value;

        if (await db.LandAreaEntries.AnyAsync(x => x.PeriodId == period.Id, ct) || await db.LandHolderCountEntries.AnyAsync(x => x.PeriodId == period.Id, ct))
            return Error.Conflict("Kỳ đã có số liệu, không thể khởi tạo lại từ kỳ trước".ToMessageForUser());

        var previous = await db.InventoryPeriods.AsNoTracking().Where(x => x.WardId == period.WardId && x.CutoffDate < period.CutoffDate)
            .OrderByDescending(x => x.CutoffDate).FirstOrDefaultAsync(ct);
        if (previous is null)
            return Error.NotFound("Xã/phường chưa có kỳ nào trước kỳ này".ToMessageForUser());

        var tree = await CatalogTree.LoadAsync(db, ct);
        var areas = (await db.LandAreaEntries.AsNoTracking().Where(x => x.PeriodId == previous.Id).ToListAsync(ct))
            .ToDictionary(x => (x.LandTypeId, x.HolderTypeId), x => x.Area);
        var counts = await db.LandHolderCountEntries.AsNoTracking().Where(x => x.PeriodId == previous.Id).ToListAsync(ct);
        if (areas.Count == 0 && counts.Count == 0)
            return Error.Conflict("Kỳ trước chưa có số liệu để chép sang".ToMessageForUser());

        var warnings = new List<string>();
        foreach (var change in await db.LandChanges.AsNoTracking().Where(x => x.PeriodId == period.Id).ToListAsync(ct))
            Apply(change, tree, areas, warnings);

        db.LandAreaEntries.AddRange(areas.Where(x => x.Value > 0).Select(x => new LandAreaEntry { PeriodId = period.Id, LandTypeId = x.Key.LandTypeId, HolderTypeId = x.Key.HolderTypeId, Area = x.Value }));
        db.LandHolderCountEntries.AddRange(counts.Select(x => new LandHolderCountEntry { PeriodId = period.Id, LandTypeId = x.LandTypeId, HolderTypeId = x.HolderTypeId, Count = x.Count }));
        await db.SaveChangesAsync(ct);
        return new PrefillResultItem(previous.Id, areas.Count(x => x.Value > 0), counts.Count, warnings);
    }

    // Biến động ghi vào ô (loại đất, đối tượng). Loại đất ở B05 có thể là dòng tổng hợp ở B01 (vd LUA gồm LUC, LUK): bỏ qua và báo lại.
    private static void Apply(LandChange change, CatalogTree tree, Dictionary<(Guid LandTypeId, Guid HolderTypeId), decimal> areas, List<string> warnings)
    {
        var label = $"{Code(tree, change.FromLandTypeId) ?? "tăng khác"} → {Code(tree, change.ToLandTypeId) ?? "giảm khác"} {change.Area:0.#####} ha ngày {change.ChangeDate:dd/MM/yyyy}";
        if (change.HolderTypeId is not { } holderId)
        {
            warnings.Add($"Biến động {label}: chưa chọn đối tượng nên chưa áp vào số liệu");
            return;
        }

        foreach (var (typeId, sign) in new[] { (change.FromLandTypeId, -1), (change.ToLandTypeId, 1) })
        {
            if (typeId is not { } id) continue;
            if (!tree.IsAreaLeaf(tree.LandTypeById[id]))
            {
                warnings.Add($"Biến động {label}: {Code(tree, id)} là dòng tổng hợp ở Biểu 01, chưa áp vào số liệu");
                continue;
            }

            var next = areas.GetValueOrDefault((id, holderId)) + sign * change.Area;
            if (next < 0) warnings.Add($"Biến động {label}: số liệu {Code(tree, id)} không đủ để trừ, đặt về 0");
            areas[(id, holderId)] = Math.Max(next, 0);
        }
    }

    private static string? Code(CatalogTree tree, Guid? id) => id is { } v ? tree.LandTypeById[v].Code : null;
}
