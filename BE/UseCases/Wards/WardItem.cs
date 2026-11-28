using LandManagement.Entities;

namespace LandManagement.UseCases.Wards;

public record WardItem(Guid Id, string WardCode, string Name, Guid ProvinceId, string ProvinceCode, string ProvinceName, DateTime CreatedAt)
{
    public static WardItem From(Ward w) => new(w.Id, w.WardCode, w.Name, w.ProvinceId, w.Province.ProvinceCode, w.Province.Name, w.CreatedAt);
}
