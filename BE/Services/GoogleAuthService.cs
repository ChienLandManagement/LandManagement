using LandManagement.Api.Security;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;

namespace LandManagement.Api.Services;

public class GoogleAuthService(IConfiguration config) : IGoogleAuthService
{
    public async Task<GoogleUserPayload?> ValidateTokenAsync(string token, CancellationToken ct = default)
    {
        var clientId = config["Google:ClientId"];
        if (string.IsNullOrWhiteSpace(clientId)) return null;
        try
        {
            var p = await GoogleJsonWebSignature.ValidateAsync(token, new GoogleJsonWebSignature.ValidationSettings { Audience = [clientId] });
            return new GoogleUserPayload(p.Email, p.Name, p.Picture, p.Subject);
        }
        catch { return null; }
    }
}
