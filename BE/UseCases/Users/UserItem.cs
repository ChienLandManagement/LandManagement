using LandManagement.Data;
using LandManagement.Entities;
using Microsoft.EntityFrameworkCore;

namespace LandManagement.UseCases.Users;

public record UserItem(Guid Id, string UserName, string FullName, string? Email, string Role, bool IsActive, DateTime CreatedAt, Guid? WardId = null, string? WardName = null, Guid? ProvinceId = null)
{
    public static UserItem From(User user) =>
        new(user.Id, user.UserName, user.FullName, user.Email, user.Role.ToString(), user.IsActive, user.CreatedAt, user.WardId, user.Ward?.Name, user.Ward?.ProvinceId);
}

public static class UserTokenExtensions
{
    // Đánh dấu thu hồi mọi refresh token còn hiệu lực của user. Chưa lưu: SaveChanges của handler lưu cùng thay đổi
    // của user trong một transaction (ExecuteUpdate sẽ chạy riêng ngoài transaction đó).
    public static async Task RevokeRefreshTokensAsync(this AppDbContext db, Guid userId, CancellationToken ct)
    {
        var tokens = await db.RefreshTokens.Where(t => t.UserId == userId && t.RevokedAt == null).ToListAsync(ct);
        foreach (var token in tokens) token.RevokedAt = DateTime.UtcNow;
    }
}
