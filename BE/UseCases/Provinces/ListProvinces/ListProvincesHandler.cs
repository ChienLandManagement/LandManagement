using ErrorOr;
using LandManagement.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Extensions;
using ResultLib.Models;

namespace LandManagement.UseCases.Provinces.ListProvinces;

public class ListProvincesHandler(AppDbContext db) : IRequestHandler<ListProvincesQuery, ErrorOr<PagedResponse<ProvinceItem>>>
{
    public async Task<ErrorOr<PagedResponse<ProvinceItem>>> Handle(ListProvincesQuery query, CancellationToken ct)
    {
        var provinces = db.Provinces.AsNoTracking();
        if (query.Query.IsNotEmpty())
        {
            var pattern = $"%{query.Query}%";
            provinces = provinces.Where(x => EF.Functions.ILike(x.ProvinceCode, pattern) || EF.Functions.ILike(x.Name, pattern));
        }

        var total = await provinces.CountAsync(ct);
        var ordered = (query.SortBy?.ToLowerInvariant(), query.IsDescending) switch
        {
            ("name", false) => provinces.OrderBy(x => x.Name),
            ("name", true) => provinces.OrderByDescending(x => x.Name),
            (_, true) => provinces.OrderByDescending(x => x.ProvinceCode),
            _ => provinces.OrderBy(x => x.ProvinceCode)
        };

        var items = await ordered.ThenBy(x => x.Id).Skip(query.Offset).Take(query.Limit).ToListAsync(ct);
        return PagedResponse<ProvinceItem>.Create(items.Select(ProvinceItem.From), total);
    }
}
