using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.Auth;

public record RefreshCommand(string? RefreshToken, string? Ip, string? UserAgent) : ICommand<AuthResult>;
