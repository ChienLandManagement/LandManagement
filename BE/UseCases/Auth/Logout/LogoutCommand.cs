using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.Auth.Logout;

public record LogoutCommand(string? RefreshToken) : ICommand;
