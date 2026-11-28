using ErrorOr;
using LandManagement.Data;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.Users.SetUserActive;

public class SetUserActiveHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<SetUserActiveCommand, ErrorOr<UserItem>>
{
    public async Task<ErrorOr<UserItem>> Handle(SetUserActiveCommand cmd, CancellationToken ct)
    {
        var user = await db.Users.Include(u => u.Wards).FirstOrDefaultAsync(u => u.Id == cmd.Id, ct);
        if (user is null) return UserRules.NotFound;
        if (!cmd.IsActive && user.Id == currentUser.Id)
            return Error.Forbidden("Không thể tự khóa tài khoản của chính mình".ToMessageForUser());

        if (!cmd.IsActive) await db.RevokeRefreshTokensAsync(user.Id, ct);
        user.IsActive = cmd.IsActive;
        await db.SaveChangesAsync(ct);
        return UserItem.From(user);
    }
}
