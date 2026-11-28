using ErrorOr;
using LandManagement.Common.Interfaces;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using LandManagement.UseCases.Dossiers;
using LandManagement.UseCases.InventoryEntries;
using LandManagement.UseCases.InventoryPeriods;
using LandManagement.UseCases.Parcels;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LandManagement.UseCases.Dashboard.Overview;

/// <summary>WardId: xã cần xem. Không truyền thì thống kê hồ sơ và thửa trong mọi xã được phép, còn xu hướng diện tích chỉ có khi xác định được một xã.</summary>
public record OverviewQuery(Guid? WardId) : IQuery<OverviewItem>;

public record DossierStatsItem(int Total, int Processing, int Backlog, int Issued, int Rejected, int NeedSupplement, int Overdue);

public record AreaTrendPoint(Guid PeriodId, DateOnly CutoffDate, decimal TotalArea, decimal AgriculturalArea, decimal NonAgriculturalArea, int ChangeCount);

public record OverviewItem(DossierStatsItem Dossiers, int ParcelTotal, int ParcelsMissingInfo, List<AreaTrendPoint> Trend);

// Số liệu phụ cho trang Tổng quan: tình hình hồ sơ GCN, thửa còn thiếu thông tin, diện tích qua các kỳ.
public class OverviewHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<OverviewQuery, ErrorOr<OverviewItem>>
{
    public async Task<ErrorOr<OverviewItem>> Handle(OverviewQuery query, CancellationToken ct)
    {
        var dossiers = db.GcnDossiers.AsNoTracking().InScope(currentUser);
        var parcels = db.Parcels.AsNoTracking().InScope(currentUser);
        if (query.WardId is { } wardId)
        {
            dossiers = dossiers.Where(x => x.WardId == wardId);
            parcels = parcels.Where(x => x.WardId == wardId);
        }

        var byStatus = await dossiers.GroupBy(x => x.Status).Select(g => new { Status = g.Key, Count = g.Count() }).ToDictionaryAsync(x => x.Status, x => x.Count, ct);
        var today = DossierRules.Today;
        var open = DossierRules.OpenStatuses;
        var overdue = await dossiers.CountAsync(x => open.Contains(x.Status) && x.DueDate != null && x.DueDate < today, ct);
        int Of(DossierStatus s) => byStatus.GetValueOrDefault(s);
        var stats = new DossierStatsItem(byStatus.Values.Sum(), Of(DossierStatus.Processing), Of(DossierStatus.Backlog), Of(DossierStatus.Issued),
            Of(DossierStatus.Rejected), Of(DossierStatus.NeedSupplement), overdue);

        var parcelTotal = await parcels.CountAsync(ct);
        var missing = await parcels.CountAsync(x => x.HolderName == null || x.HolderName == "" || x.HolderTypeId == null || x.Address == null || x.Address == "", ct);
        return new OverviewItem(stats, parcelTotal, missing, await LoadTrendAsync(query.WardId, ct));
    }

    private async Task<List<AreaTrendPoint>> LoadTrendAsync(Guid? requestedWardId, CancellationToken ct)
    {
        var wardId = currentUser.Resolve(requestedWardId);
        if (wardId is null) return [];

        var periods = await db.InventoryPeriods.AsNoTracking().InScope(currentUser).Where(x => x.WardId == wardId).OrderBy(x => x.CutoffDate).ToListAsync(ct);
        var periodIds = periods.Select(x => x.Id).ToList();
        var tree = await CatalogTree.LoadAsync(db, ct);
        var areas = (await db.LandAreaEntries.AsNoTracking().Where(x => periodIds.Contains(x.PeriodId)).ToListAsync(ct))
            .GroupBy(x => x.PeriodId).ToDictionary(g => g.Key, g => g.GroupBy(x => x.LandTypeId).ToDictionary(l => l.Key, l => l.Sum(x => x.Area)));
        var changeCounts = await db.LandChanges.AsNoTracking().Where(x => periodIds.Contains(x.PeriodId))
            .GroupBy(x => x.PeriodId).Select(g => new { g.Key, Count = g.Count() }).ToDictionaryAsync(x => x.Key, x => x.Count, ct);

        decimal AreaOf(Dictionary<Guid, decimal> byLeaf, string code) =>
            tree.LandTypeByCode.TryGetValue(code, out var type) ? tree.AreaLeavesUnder(type).Sum(l => byLeaf.GetValueOrDefault(l.Id)) : 0;

        return periods.Where(p => areas.ContainsKey(p.Id)).Select(p =>
        {
            var agri = AreaOf(areas[p.Id], "NNP");
            var nonAgri = AreaOf(areas[p.Id], "PNN");
            return new AreaTrendPoint(p.Id, p.CutoffDate, agri + nonAgri, agri, nonAgri, changeCounts.GetValueOrDefault(p.Id));
        }).ToList();
    }
}
