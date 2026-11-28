using LandManagement.Entities;

namespace LandManagement.UseCases.Provinces;

public record ProvinceItem(Guid Id, string ProvinceCode, string Name, string? ShortName, string? PlaceType, string? Country, DateTime CreatedAt)
{
    public static ProvinceItem From(Province p) => new(p.Id, p.ProvinceCode, p.Name, p.ShortName, p.PlaceType, p.Country, p.CreatedAt);
}
