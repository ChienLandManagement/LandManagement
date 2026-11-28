using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.Wards.UpdateWard;

public record UpdateWardCommand(Guid Id, string WardCode, string Name, Guid ProvinceId) : ICommand<WardItem>;
