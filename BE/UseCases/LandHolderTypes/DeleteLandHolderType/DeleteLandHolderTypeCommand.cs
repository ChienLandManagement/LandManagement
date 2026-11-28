using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.LandHolderTypes.DeleteLandHolderType;

public record DeleteLandHolderTypeCommand(Guid Id) : ICommand<ErrorOr.Success>;
