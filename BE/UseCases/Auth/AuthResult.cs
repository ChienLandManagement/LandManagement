using LandManagement.Entities;

namespace LandManagement.UseCases.Auth;

public record UserProfile(Guid Id, string UserName, string FullName, string? Email, string Role)
{
    public static UserProfile From(User user) =>
        new(user.Id, user.UserName, user.FullName, user.Email, user.Role.ToString());
}

public record AuthResult(string AccessToken, DateTime AccessExpiresAt, string RefreshToken, DateTime RefreshExpiresAt, UserProfile User);

public record LoginResponse(string AccessToken, DateTime AccessExpiresAt, UserProfile User);
