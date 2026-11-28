using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.LandChanges.DeleteLandChange;

public record DeleteLandChangeCommand(Guid Id) : ICommand<ErrorOr.Success>;
