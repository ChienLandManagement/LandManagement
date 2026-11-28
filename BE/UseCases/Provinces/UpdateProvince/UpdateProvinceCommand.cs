using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.Provinces.UpdateProvince;

public record UpdateProvinceCommand(Guid Id, string ProvinceCode, string Name, string ShortName, string PlaceType, string? Country = null) : ICommand<ProvinceItem>;
