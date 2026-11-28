using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.Wards.CreateWard;

public record CreateWardCommand(string WardCode, string Name, Guid ProvinceId) : ICommand<WardItem>;
