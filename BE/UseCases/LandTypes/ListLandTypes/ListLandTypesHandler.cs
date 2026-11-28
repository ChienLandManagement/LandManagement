using ErrorOr;
using LandManagement.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LandManagement.UseCases.LandTypes.ListLandTypes;

public class ListLandTypesHandler(AppDbContext db) : IRequestHandler<ListLandTypesQuery, ErrorOr<List<LandTypeItem>>>
{
    public async Task<ErrorOr<List<LandTypeItem>>> Handle(ListLandTypesQuery query, CancellationToken ct)
    {
        IQueryable<Entities.LandType> items = db.LandTypes.AsNoTracking();
        var rows = await items.OrderBy(x => x.SortOrder).ThenBy(x => x.Code).ToListAsync(ct);
        return rows.Select(LandTypeItem.From).ToList();
    }
}
