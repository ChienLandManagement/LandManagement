using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.LandTypes.DeleteLandType;

public record DeleteLandTypeCommand(Guid Id) : ICommand<ErrorOr.Success>;
