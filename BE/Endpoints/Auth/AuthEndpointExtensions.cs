using ErrorOr;
using FastEndpoints;
using LandManagement.UseCases.Auth;
using ResultLib.Extensions;
using Result = ResultLib.Core.Result;

namespace LandManagement.Endpoints.Auth;

public static class AuthEndpointExtensions
{
    private const string RefreshCookieName = "refresh_token";
    private const string RefreshCookiePath = "/api/auth";

    extension(HttpContext ctx)
    {
        public string? ClientIp => ctx.Connection.RemoteIpAddress?.ToString();

        public string ClientUserAgent => ctx.Request.Headers.UserAgent.ToString();

        public string? GetRefreshToken() => ctx.Request.Cookies[RefreshCookieName];

        public void DeleteRefreshToken() =>
            ctx.Response.Cookies.Delete(RefreshCookieName, new CookieOptions { Path = RefreshCookiePath });

        // Refresh token chỉ nằm trong cookie HttpOnly, không trả ra body.
        public Result ToLoginResult(ErrorOr<AuthResult> result)
        {
            if (result.IsError) return result.ToResult();

            var auth = result.Value;
            ctx.Response.Cookies.Append(RefreshCookieName, auth.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = ctx.Request.IsHttps,
                SameSite = SameSiteMode.Lax,
                Expires = auth.RefreshExpiresAt,
                Path = RefreshCookiePath
            });
            return Result.Ok(new LoginResponse(auth.AccessToken, auth.AccessExpiresAt, auth.User));
        }
    }
}
