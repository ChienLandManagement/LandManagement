using ErrorOr;
using LandManagement.Data;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Extensions;
using ResultLib.Models;

namespace LandManagement.UseCases.Dossiers.ListDossiers;

public class ListDossiersHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<ListDossiersQuery, ErrorOr<PagedResponse<DossierItem>>>
{
    public async Task<ErrorOr<PagedResponse<DossierItem>>> Handle(ListDossiersQuery query, CancellationToken ct)
    {
        var dossiers = db.GcnDossiers.AsNoTracking().Include(x => x.Ward).Include(x => x.Parcel).InScope(currentUser);
        if (query.WardId is { } wardId) dossiers = dossiers.Where(x => x.WardId == wardId);
        if (query.Status is { } status) dossiers = dossiers.Where(x => x.Status == status);
        if (query.ReceivedFrom is { } from) dossiers = dossiers.Where(x => x.ReceivedDate >= from);
        if (query.ReceivedTo is { } to) dossiers = dossiers.Where(x => x.ReceivedDate <= to);
        if (query.Overdue == true)
        {
            var today = DossierRules.Today;
            var open = DossierRules.OpenStatuses;
            dossiers = dossiers.Where(x => open.Contains(x.Status) && x.DueDate != null && x.DueDate < today);
        }

        if (query.Query.IsNotEmpty())
        {
            var pattern = $"%{query.Query}%";
            dossiers = dossiers.Where(x => EF.Functions.ILike(x.Code, pattern) || EF.Functions.ILike(x.ApplicantName, pattern)
                || (x.Parcel != null && (EF.Functions.ILike(x.Parcel.MapSheet, pattern) || EF.Functions.ILike(x.Parcel.ParcelNumber, pattern))));
        }

        var total = await dossiers.CountAsync(ct);
        var items = await dossiers.OrderByDescending(x => x.ReceivedDate).ThenBy(x => x.Code).Skip(query.Offset).Take(query.Limit).ToListAsync(ct);
        return PagedResponse<DossierItem>.Create(items.Select(DossierItem.From), total);
    }
}
