using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.Wards.DeleteWard;

public record DeleteWardCommand(Guid Id) : ICommand<ErrorOr.Success>;
