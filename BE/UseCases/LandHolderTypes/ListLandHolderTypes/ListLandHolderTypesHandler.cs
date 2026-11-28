using ErrorOr;
using LandManagement.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LandManagement.UseCases.LandHolderTypes.ListLandHolderTypes;

public class ListLandHolderTypesHandler(AppDbContext db) : IRequestHandler<ListLandHolderTypesQuery, ErrorOr<List<LandHolderTypeItem>>>
{
    public async Task<ErrorOr<List<LandHolderTypeItem>>> Handle(ListLandHolderTypesQuery query, CancellationToken ct)
    {
        IQueryable<Entities.LandHolderType> items = db.LandHolderTypes.AsNoTracking();
        if (query.Kind is { } kind) items = items.Where(x => x.Kind == kind);
        var rows = await items.OrderBy(x => x.SortOrder).ThenBy(x => x.Code).ToListAsync(ct);
        return rows.Select(LandHolderTypeItem.From).ToList();
    }
}
