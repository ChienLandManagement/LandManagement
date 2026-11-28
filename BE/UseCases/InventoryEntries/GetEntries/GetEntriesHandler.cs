using ErrorOr;
using LandManagement.Data;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LandManagement.UseCases.InventoryEntries.GetEntries;

public class GetEntriesHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<GetEntriesQuery, ErrorOr<PeriodEntriesItem>>
{
    public async Task<ErrorOr<PeriodEntriesItem>> Handle(GetEntriesQuery query, CancellationToken ct)
    {
        var period = await PeriodLookup.FindAsync(db, currentUser, query.PeriodId, ct);
        if (period.IsError) return period.Errors;

        var areas = await db.LandAreaEntries.AsNoTracking().Where(x => x.PeriodId == query.PeriodId)
            .Select(x => new AreaCellItem(x.LandTypeId, x.HolderTypeId, x.Area)).ToListAsync(ct);
        var counts = await db.LandHolderCountEntries.AsNoTracking().Where(x => x.PeriodId == query.PeriodId)
            .Select(x => new CountCellItem(x.LandTypeId, x.HolderTypeId, x.Count)).ToListAsync(ct);
        return new PeriodEntriesItem(query.PeriodId, period.Value.Status.ToString(), areas, counts);
    }
}
