using ErrorOr;
using LandManagement.Data;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Extensions;

namespace LandManagement.UseCases.Auth.Logout;

public class LogoutHandler(AppDbContext db, ITokenService tokens) : IRequestHandler<LogoutCommand, ErrorOr<Success>>
{
    public async Task<ErrorOr<Success>> Handle(LogoutCommand cmd, CancellationToken ct)
    {
        if (cmd.RefreshToken.IsEmpty()) return Result.Success;

        var hash = tokens.Hash(cmd.RefreshToken);
        var stored = await db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash && t.RevokedAt == null, ct);
        if (stored is null) return Result.Success;

        stored.RevokedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return Result.Success;
    }
}
