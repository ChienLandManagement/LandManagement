using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.Provinces.DeleteProvince;

public record DeleteProvinceCommand(Guid Id) : ICommand<ErrorOr.Success>;
