using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.Auth.Login;

public record LoginCommand(string UserName, string Password, string? Ip, string? UserAgent) : ICommand<AuthResult>;
