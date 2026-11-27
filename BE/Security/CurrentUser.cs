using LandManagement.Entities;

namespace LandManagement.Security;

public interface ICurrentUser
{
    Guid Id { get; }
    string? Name { get; }
    string? IpAddress { get; }
    bool IsAdmin { get; }
}

public class CurrentUser(IHttpContextAccessor httpContextAccessor) : ICurrentUser
{
    private HttpContext? Context => httpContextAccessor.HttpContext;

    // Token đặt claim "sub", "name" và role (MapInboundClaims = false nên giữ nguyên tên claim).
    public Guid Id => Guid.TryParse(Context?.User.FindFirst("sub")?.Value, out var id) ? id : Guid.Empty;

    public string? Name => Context?.User.FindFirst("name")?.Value;

    public string? IpAddress => Context?.Connection.RemoteIpAddress?.ToString();

    public bool IsAdmin => Context?.User.IsInRole(nameof(UserRole.Admin)) ?? false;
}
