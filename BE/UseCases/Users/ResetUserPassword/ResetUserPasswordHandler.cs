using ErrorOr;
using LandManagement.Data;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LandManagement.UseCases.Users.ResetUserPassword;

public class ResetUserPasswordHandler(AppDbContext db, IPasswordHasher hasher) : IRequestHandler<ResetUserPasswordCommand, ErrorOr<Success>>
{
    public async Task<ErrorOr<Success>> Handle(ResetUserPasswordCommand cmd, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == cmd.Id, ct);
        if (user is null) return UserRules.NotFound;

        await db.RevokeRefreshTokensAsync(user.Id, ct);
        user.PasswordHash = hasher.Hash(cmd.NewPassword);
        await db.SaveChangesAsync(ct);
        return Result.Success;
    }
}
