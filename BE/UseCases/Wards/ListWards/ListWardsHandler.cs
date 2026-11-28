using ErrorOr;
using LandManagement.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Extensions;
using ResultLib.Models;

namespace LandManagement.UseCases.Wards.ListWards;

public class ListWardsHandler(AppDbContext db) : IRequestHandler<ListWardsQuery, ErrorOr<PagedResponse<WardItem>>>
{
    public async Task<ErrorOr<PagedResponse<WardItem>>> Handle(ListWardsQuery query, CancellationToken ct)
    {
        var wards = db.Wards.AsNoTracking().Include(x => x.Province).AsQueryable();
        if (query.ProvinceId is { } provinceId)
            wards = wards.Where(x => x.ProvinceId == provinceId);
        if (query.Query.IsNotEmpty())
        {
            var pattern = $"%{query.Query}%";
            wards = wards.Where(x => EF.Functions.ILike(x.WardCode, pattern) || EF.Functions.ILike(x.Name, pattern));
        }

        var total = await wards.CountAsync(ct);
        var ordered = (query.SortBy?.ToLowerInvariant(), query.IsDescending) switch
        {
            ("name", false) => wards.OrderBy(x => x.Name),
            ("name", true) => wards.OrderByDescending(x => x.Name),
            (_, true) => wards.OrderByDescending(x => x.WardCode),
            _ => wards.OrderBy(x => x.WardCode)
        };

        var items = await ordered.ThenBy(x => x.Id).Skip(query.Offset).Take(query.Limit).ToListAsync(ct);
        return PagedResponse<WardItem>.Create(items.Select(WardItem.From), total);
    }
}
