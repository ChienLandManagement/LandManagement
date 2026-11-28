using ErrorOr;
using LandManagement.Data;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Extensions;
using ResultLib.Logging;

namespace LandManagement.UseCases.Auth;

public class RefreshHandler(AppDbContext db, ITokenService tokens) : IRequestHandler<RefreshCommand, ErrorOr<AuthResult>>
{
    private static readonly Error Invalid = Error.Unauthorized("Phiên đăng nhập đã hết hạn".ToMessageForUser());

    public async Task<ErrorOr<AuthResult>> Handle(RefreshCommand cmd, CancellationToken ct)
    {
        if (cmd.RefreshToken.IsEmpty()) return Invalid;

        var hash = tokens.Hash(cmd.RefreshToken);
        var stored = await db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash, ct);
        if (stored is null) return Invalid;

        if (!stored.IsActive)
        {
            // Token đã thu hồi mà vẫn được gửi lại: nghi bị đánh cắp, thu hồi các token còn hiệu lực của user.
            if (stored.RevokedAt is not null)
                await db.RefreshTokens
                    .Where(t => t.UserId == stored.UserId && t.RevokedAt == null)
                    .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, DateTime.UtcNow), ct);
            return Invalid;
        }

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == stored.UserId, ct);
        if (user is null || !user.IsActive) return Invalid;

        var (result, next) = tokens.CreateSession(user, cmd.Ip, cmd.UserAgent);
        // Thu hồi có điều kiện để hai request song song cùng token chỉ một request thắng.
        var revoked = await db.RefreshTokens
            .Where(t => t.Id == stored.Id && t.RevokedAt == null)
            .ExecuteUpdateAsync(s => s
                .SetProperty(t => t.RevokedAt, DateTime.UtcNow)
                .SetProperty(t => t.ReplacedByHash, next.TokenHash), ct);
        if (revoked == 0) return Invalid;

        db.RefreshTokens.Add(next);
        await db.SaveChangesAsync(ct);
        return result;
    }
}
