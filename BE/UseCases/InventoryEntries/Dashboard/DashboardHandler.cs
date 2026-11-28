using ErrorOr;
using LandManagement.Data;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LandManagement.UseCases.InventoryEntries.Dashboard;

// Tổng quan một kỳ: tổng diện tích, nông nghiệp / phi nông nghiệp, cơ cấu loại đất (nhóm và loại cấp 2) và biến động ròng trong kỳ.
public class DashboardHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<DashboardQuery, ErrorOr<DashboardItem>>
{
    private const string AgriCode = "NNP";
    private const string NonAgriCode = "PNN";

    public async Task<ErrorOr<DashboardItem>> Handle(DashboardQuery query, CancellationToken ct)
    {
        var found = await PeriodLookup.FindAsync(db, currentUser, query.PeriodId, ct);
        if (found.IsError) return found.Errors;
        var period = found.Value;

        var tree = await CatalogTree.LoadAsync(db, ct);
        var areas = await db.LandAreaEntries.AsNoTracking().Where(x => x.PeriodId == period.Id).ToListAsync(ct);
        var byLeaf = areas.GroupBy(x => x.LandTypeId).ToDictionary(g => g.Key, g => g.Sum(x => x.Area));
        var changes = await db.LandChanges.AsNoTracking().Where(x => x.PeriodId == period.Id).ToListAsync(ct);

        decimal AreaOf(Guid typeId) => AreaIn(tree, byLeaf, typeId);
        decimal ChangeOf(Guid typeId) =>
            changes.Where(c => c.ToLandTypeId == typeId).Sum(c => c.Area) - changes.Where(c => c.FromLandTypeId == typeId).Sum(c => c.Area);

        var agri = tree.LandTypeByCode.TryGetValue(AgriCode, out var a) ? AreaOf(a.Id) : 0;
        var nonAgri = tree.LandTypeByCode.TryGetValue(NonAgriCode, out var n) ? AreaOf(n.Id) : 0;
        var total = agri + nonAgri;

        // Cấp 1 (nhóm đất) và cấp 2 (không tính dòng "trong đó").
        var rows = tree.LandTypes.Where(t => !t.IsMemo && (t.ParentId is null || tree.LandTypeById[t.ParentId.Value].ParentId is null))
            .Select(t => new DashboardLandTypeItem(t.Code, t.Name, t.ParentId is null ? 1 : 2, AreaOf(t.Id), Percent(AreaOf(t.Id), total), ChangeOf(t.Id)))
            .ToList();

        var previous = await db.InventoryPeriods.AsNoTracking().Where(x => x.WardId == period.WardId && x.CutoffDate < period.CutoffDate)
            .OrderByDescending(x => x.CutoffDate).FirstOrDefaultAsync(ct);
        decimal? previousTotal = null;
        if (previous is not null)
        {
            var previousByLeaf = await db.LandAreaEntries.AsNoTracking().Where(x => x.PeriodId == previous.Id)
                .GroupBy(x => x.LandTypeId).ToDictionaryAsync(g => g.Key, g => g.Sum(x => x.Area), ct);
            previousTotal = new[] { AgriCode, NonAgriCode }.Where(tree.LandTypeByCode.ContainsKey).Sum(c => AreaIn(tree, previousByLeaf, tree.LandTypeByCode[c].Id));
        }

        return new DashboardItem(period.Id, period.CutoffDate, total, agri, nonAgri, Percent(agri, total), Percent(nonAgri, total),
            previous?.CutoffDate, previousTotal, changes.Count, rows);
    }

    private static decimal AreaIn(CatalogTree tree, Dictionary<Guid, decimal> byLeaf, Guid typeId) =>
        tree.AreaLeavesUnder(tree.LandTypeById[typeId]).Sum(l => byLeaf.GetValueOrDefault(l.Id));

    private static decimal Percent(decimal part, decimal total) => total == 0 ? 0 : Math.Round(part * 100 / total, 2);
}
