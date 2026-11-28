using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.Auth;

public record LogoutCommand(string? RefreshToken) : ICommand;
