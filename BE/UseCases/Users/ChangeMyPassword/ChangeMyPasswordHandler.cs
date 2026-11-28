using ErrorOr;
using LandManagement.Data;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.Users.ChangeMyPassword;

public class ChangeMyPasswordHandler(AppDbContext db, ICurrentUser currentUser, IPasswordHasher hasher) : IRequestHandler<ChangeMyPasswordCommand, ErrorOr<Success>>
{
    public async Task<ErrorOr<Success>> Handle(ChangeMyPasswordCommand cmd, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == currentUser.Id && u.IsActive, ct);
        if (user is null) return UserRules.NotFound;
        if (!hasher.Verify(cmd.CurrentPassword, user.PasswordHash))
            return Error.Validation("Mật khẩu hiện tại không đúng".ToMessageForUser());

        await db.RevokeRefreshTokensAsync(user.Id, ct);
        user.PasswordHash = hasher.Hash(cmd.NewPassword);
        await db.SaveChangesAsync(ct);
        return Result.Success;
    }
}
