using ErrorOr;
using LandManagement.Data;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Models;

namespace LandManagement.UseCases.InventoryPeriods.ListPeriods;

public class ListPeriodsHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<ListPeriodsQuery, ErrorOr<PagedResponse<InventoryPeriodItem>>>
{
    public async Task<ErrorOr<PagedResponse<InventoryPeriodItem>>> Handle(ListPeriodsQuery query, CancellationToken ct)
    {
        var periods = db.InventoryPeriods.AsNoTracking().InScope(currentUser);
        if (query.WardId is { } wardId)
            periods = periods.Where(x => x.WardId == wardId);

        var total = await periods.CountAsync(ct);
        var ordered = query.IsDescending ? periods.OrderByDescending(x => x.CutoffDate) : periods.OrderBy(x => x.CutoffDate);
        var items = await ordered.ThenBy(x => x.Id).Include(x => x.Ward).Skip(query.Offset).Take(query.Limit).ToListAsync(ct);
        var ids = items.Select(x => x.Id).ToList();
        var counts = await db.LandChanges.Where(c => ids.Contains(c.PeriodId)).GroupBy(c => c.PeriodId)
            .Select(g => new { g.Key, Count = g.Count() }).ToDictionaryAsync(g => g.Key, g => g.Count, ct);
        return PagedResponse<InventoryPeriodItem>.Create(items.Select(p => InventoryPeriodItem.From(p, counts.GetValueOrDefault(p.Id))), total);
    }
}
