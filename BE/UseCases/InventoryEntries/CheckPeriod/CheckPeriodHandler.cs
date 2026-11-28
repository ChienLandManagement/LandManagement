using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LandManagement.UseCases.InventoryEntries.CheckPeriod;

// Kiểm tra số liệu một kỳ: (1) số từng loại đất có bằng kỳ trước cộng biến động không; (2) diện tích và số lượng có đi cùng nhau không.
public class CheckPeriodHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<CheckPeriodQuery, ErrorOr<PeriodCheckItem>>
{
    private const decimal Tolerance = 0.005m;

    public async Task<ErrorOr<PeriodCheckItem>> Handle(CheckPeriodQuery query, CancellationToken ct)
    {
        var found = await PeriodLookup.FindAsync(db, currentUser, query.PeriodId, ct);
        if (found.IsError) return found.Errors;
        var period = found.Value;

        var tree = await CatalogTree.LoadAsync(db, ct);
        var areas = await db.LandAreaEntries.AsNoTracking().Where(x => x.PeriodId == period.Id).ToListAsync(ct);
        var counts = await db.LandHolderCountEntries.AsNoTracking().Where(x => x.PeriodId == period.Id).ToListAsync(ct);
        var issues = new List<CheckIssueItem>();

        var previous = await db.InventoryPeriods.AsNoTracking().Where(x => x.WardId == period.WardId && x.CutoffDate < period.CutoffDate)
            .OrderByDescending(x => x.CutoffDate).FirstOrDefaultAsync(ct);
        if (previous is not null && areas.Count > 0)
        {
            var previousAreas = await db.LandAreaEntries.AsNoTracking().Where(x => x.PeriodId == previous.Id).ToListAsync(ct);
            if (previousAreas.Count > 0) CheckAgainstPrevious(tree, areas, previousAreas, await LoadDeltasAsync(period.Id, ct), issues);
        }

        if (areas.Count > 0 && counts.Count > 0) CheckAreaVsCount(tree, areas, counts, issues);
        return new PeriodCheckItem(period.Id, previous?.Id, areas.Count > 0, counts.Count > 0, issues);
    }

    // Biến động ròng theo loại đất của kỳ: đất vào cộng, đất ra trừ (tăng khác chỉ cộng, giảm khác chỉ trừ).
    private async Task<Dictionary<Guid, decimal>> LoadDeltasAsync(Guid periodId, CancellationToken ct)
    {
        var deltas = new Dictionary<Guid, decimal>();
        foreach (var c in await db.LandChanges.AsNoTracking().Where(x => x.PeriodId == periodId).ToListAsync(ct))
        {
            if (c.ToLandTypeId is { } to) deltas[to] = deltas.GetValueOrDefault(to) + c.Area;
            if (c.FromLandTypeId is { } from) deltas[from] = deltas.GetValueOrDefault(from) - c.Area;
        }

        return deltas;
    }

    private static void CheckAgainstPrevious(CatalogTree tree, List<LandAreaEntry> areas, List<LandAreaEntry> previousAreas,
        Dictionary<Guid, decimal> deltas, List<CheckIssueItem> issues)
    {
        var current = areas.GroupBy(x => x.LandTypeId).ToDictionary(g => g.Key, g => g.Sum(x => x.Area));
        var before = previousAreas.GroupBy(x => x.LandTypeId).ToDictionary(g => g.Key, g => g.Sum(x => x.Area));
        foreach (var type in tree.LandTypes.Where(t => t.InB05 && !t.IsMemo))
        {
            var leaves = tree.AreaLeavesUnder(type).ToList();
            var expected = leaves.Sum(l => before.GetValueOrDefault(l.Id)) + deltas.GetValueOrDefault(type.Id);
            var actual = leaves.Sum(l => current.GetValueOrDefault(l.Id));
            if (Math.Abs(expected - actual) > Tolerance)
                issues.Add(new CheckIssueItem("PreviousPeriod",
                    $"{type.Code} - {type.Name}: kỳ trước cộng biến động = {expected:0.#####} ha, số kỳ này = {actual:0.#####} ha (lệch {actual - expected:+0.#####;-0.#####})",
                    type.Code, expected, actual));
        }
    }

    private static void CheckAreaVsCount(CatalogTree tree, List<LandAreaEntry> areas, List<LandHolderCountEntry> counts, List<CheckIssueItem> issues)
    {
        var areaByCell = areas.ToDictionary(x => (x.LandTypeId, x.HolderTypeId), x => x.Area);
        var countByCell = counts.ToDictionary(x => (x.LandTypeId, x.HolderTypeId), x => x.Count);
        foreach (var type in tree.LandTypes.Where(tree.IsCountLeaf))
        {
            var leaves = tree.AreaLeavesUnder(type).ToList();
            foreach (var holder in tree.Holders.Where(h => tree.IsHolderLeaf(h.Id)))
            {
                var area = leaves.Sum(l => areaByCell.GetValueOrDefault((l.Id, holder.Id)));
                var count = countByCell.GetValueOrDefault((type.Id, holder.Id));
                if (area > 0 && count == 0)
                    issues.Add(new CheckIssueItem("AreaVsCount", $"{type.Code}, đối tượng {holder.Code}: có diện tích {area:0.#####} ha nhưng chưa có số lượng", type.Code, null, area));
                else if (area == 0 && count > 0)
                    issues.Add(new CheckIssueItem("AreaVsCount", $"{type.Code}, đối tượng {holder.Code}: có số lượng {count} nhưng chưa có diện tích", type.Code, null, count));
            }
        }
    }
}
