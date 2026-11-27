namespace LandManagement.Api.Security;

public interface IGoogleAuthService
{
    Task<GoogleUserPayload?> ValidateTokenAsync(string googleToken, CancellationToken cancellationToken = default);
}

public sealed record GoogleUserPayload(string Email, string Name, string Picture, string Subject);
