using ErrorOr;
using LandManagement.Data;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Extensions;

namespace LandManagement.UseCases.Auth;

public class LogoutHandler(AppDbContext db, ITokenService tokens) : IRequestHandler<LogoutCommand, ErrorOr<Unit>>
{
    public async Task<ErrorOr<Unit>> Handle(LogoutCommand cmd, CancellationToken ct)
    {
        if (cmd.RefreshToken.IsEmpty()) return Unit.Value;

        var hash = tokens.Hash(cmd.RefreshToken);
        var stored = await db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash && t.RevokedAt == null, ct);
        if (stored is null) return Unit.Value;

        stored.RevokedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
