using ErrorOr;
using LandManagement.Data;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Extensions;
using ResultLib.Models;

namespace LandManagement.UseCases.Parcels.ListParcels;

public class ListParcelsHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<ListParcelsQuery, ErrorOr<PagedResponse<ParcelItem>>>
{
    public async Task<ErrorOr<PagedResponse<ParcelItem>>> Handle(ListParcelsQuery query, CancellationToken ct)
    {
        var parcels = db.Parcels.AsNoTracking().Include(x => x.Ward).Include(x => x.LandType).Include(x => x.HolderType).InScope(currentUser);
        if (query.WardId is { } wardId) parcels = parcels.Where(x => x.WardId == wardId);
        if (query.LandTypeId is { } landTypeId) parcels = parcels.Where(x => x.LandTypeId == landTypeId);
        if (query.MissingInfo == true) parcels = parcels.Where(x => x.HolderName == null || x.HolderName == "" || x.HolderTypeId == null || x.Address == null || x.Address == "");
        if (query.Query.IsNotEmpty())
        {
            var pattern = $"%{query.Query}%";
            parcels = parcels.Where(x => EF.Functions.ILike(x.MapSheet, pattern) || EF.Functions.ILike(x.ParcelNumber, pattern)
                || (x.HolderName != null && EF.Functions.ILike(x.HolderName, pattern)) || (x.Address != null && EF.Functions.ILike(x.Address, pattern)));
        }

        var total = await parcels.CountAsync(ct);
        var items = await parcels.OrderBy(x => x.MapSheet).ThenBy(x => x.ParcelNumber).Skip(query.Offset).Take(query.Limit).ToListAsync(ct);
        return PagedResponse<ParcelItem>.Create(items.Select(ParcelItem.From), total);
    }
}
