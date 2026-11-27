using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using ResultLib.Extensions;

namespace LandManagement.Services;

public interface IGoogleAuthService
{
    Task<GoogleUserPayload?> ValidateTokenAsync(string googleToken, CancellationToken cancellationToken = default);
}

public sealed record GoogleUserPayload(string Email, string Name, string Picture, string Subject);

public class GoogleAuthService(IConfiguration config) : IGoogleAuthService
{
    public async Task<GoogleUserPayload?> ValidateTokenAsync(string token, CancellationToken ct = default)
    {
        var clientId = config["Google:ClientId"];
        if (clientId.IsEmpty()) return null;
        try
        {
            var p = await GoogleJsonWebSignature.ValidateAsync(token, new GoogleJsonWebSignature.ValidationSettings { Audience = [clientId] });
            return new GoogleUserPayload(p.Email, p.Name, p.Picture, p.Subject);
        }
        catch { return null; }
    }
}
