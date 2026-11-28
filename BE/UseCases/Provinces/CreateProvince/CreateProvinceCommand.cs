using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.Provinces.CreateProvince;

public record CreateProvinceCommand(string ProvinceCode, string Name, string ShortName, string PlaceType, string? Country = null) : ICommand<ProvinceItem>;
