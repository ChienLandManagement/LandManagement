using System.Security.Claims;
using LandManagement.Entities;

namespace LandManagement.Security;

public interface ICurrentUser
{
    Guid Id { get; }
    string? Name { get; }
    string? IpAddress { get; }
    bool IsAdmin { get; }
    UserRole? Role { get; }
    IReadOnlyList<Guid> WardIds { get; }
}

public class CurrentUser(IHttpContextAccessor httpContextAccessor) : ICurrentUser
{
    private HttpContext? Context => httpContextAccessor.HttpContext;

    // Token đặt claim "sub", "name", "role" và các "ward_id" (MapInboundClaims = false nên giữ nguyên tên claim).
    public Guid Id => Guid.TryParse(Context?.User.FindFirst("sub")?.Value, out var id) ? id : Guid.Empty;

    public string? Name => Context?.User.FindFirst("name")?.Value;

    public string? IpAddress => Context?.Connection.RemoteIpAddress?.ToString();

    public bool IsAdmin => Context?.User.IsInRole(nameof(UserRole.Admin)) ?? false;

    public UserRole? Role => Enum.TryParse<UserRole>(Context?.User.FindFirst("role")?.Value ?? Context?.User.FindFirst(ClaimTypes.Role)?.Value, out var role) ? role : null;

    // Mỗi xã được phân công là một claim "ward_id".
    public IReadOnlyList<Guid> WardIds => Context?.User.FindAll("ward_id").Select(c => Guid.TryParse(c.Value, out var id) ? id : Guid.Empty)
        .Where(id => id != Guid.Empty).ToList() ?? [];
}