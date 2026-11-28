using ErrorOr;
using LandManagement.Data;
using LandManagement.Security;
using LandManagement.UseCases.InventoryPeriods;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;
using ResultLib.Models;

namespace LandManagement.UseCases.LandChanges.ListLandChanges;

public class ListLandChangesHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<ListLandChangesQuery, ErrorOr<PagedResponse<LandChangeItem>>>
{
    public async Task<ErrorOr<PagedResponse<LandChangeItem>>> Handle(ListLandChangesQuery query, CancellationToken ct)
    {
        if (!await db.InventoryPeriods.InScope(currentUser).AnyAsync(x => x.Id == query.PeriodId, ct))
            return Error.NotFound("Không tìm thấy kỳ kiểm kê".ToMessageForUser());

        var changes = db.LandChanges.AsNoTracking().Where(x => x.PeriodId == query.PeriodId);
        var total = await changes.CountAsync(ct);
        var ordered = query.IsDescending ? changes.OrderByDescending(x => x.ChangeDate) : changes.OrderBy(x => x.ChangeDate);
        var items = await ordered.ThenBy(x => x.Id)
            .Include(x => x.FromLandType).Include(x => x.ToLandType).Include(x => x.HolderType)
            .Skip(query.Offset).Take(query.Limit).ToListAsync(ct);
        return PagedResponse<LandChangeItem>.Create(items.Select(LandChangeItem.From), total);
    }
}
