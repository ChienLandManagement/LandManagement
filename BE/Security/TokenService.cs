using System.Security.Cryptography;
using System.Text;
using FastEndpoints.Security;
using LandManagement.Common;
using LandManagement.Entities;
using LandManagement.UseCases.Auth;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;

namespace LandManagement.Security;

public interface ITokenService
{
    (AuthResult Result, RefreshToken Entity) CreateSession(User user, string? ip, string? userAgent);
    string Hash(string token);
}

public class TokenService(IOptions<JwtOptions> options) : ITokenService
{
    private readonly JwtOptions _options = options.Value;

    public (AuthResult Result, RefreshToken Entity) CreateSession(User user, string? ip, string? userAgent)
    {
        var accessExpires = DateTime.UtcNow.AddMinutes(_options.AccessTokenMinutes);
        var accessToken = JwtBearer.CreateToken(o =>
        {
            o.SigningKey = _options.SigningKey;
            o.Issuer = _options.Issuer;
            o.Audience = _options.Audience;
            o.ExpireAt = accessExpires;
            o.User.Roles.Add(user.Role.ToString());
            o.User.Claims.Add(("sub", user.Id.ToString()));
            o.User.Claims.Add(("name", user.FullName));
            if (user.Email is not null) o.User.Claims.Add(("email", user.Email));
            foreach (var ward in user.Wards) o.User.Claims.Add(("ward_id", ward.Id.ToString()));
        });

        var refreshToken = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(64));
        var device = DeviceInfoParser.Parse(userAgent);
        var entity = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = Hash(refreshToken),
            ExpiresAt = DateTime.UtcNow.AddDays(_options.RefreshTokenDays),
            CreatedByIp = ip,
            Browser = device.Browser,
            Os = device.Os,
            DeviceType = device.DeviceType
        };
        return (new AuthResult(accessToken, accessExpires, refreshToken, entity.ExpiresAt, UserProfile.From(user)), entity);
    }

    public string Hash(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}
