using ErrorOr;
using LandManagement.Data;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Extensions;
using ResultLib.Logging;

namespace LandManagement.UseCases.Users.UpdateUser;

public class UpdateUserHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<UpdateUserCommand, ErrorOr<UserItem>>
{
    public async Task<ErrorOr<UserItem>> Handle(UpdateUserCommand cmd, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == cmd.Id, ct);
        if (user is null) return UserRules.NotFound;

        var roleChanged = user.Role != cmd.Role;
        if (roleChanged && user.Id == currentUser.Id)
            return Error.Forbidden("Không thể tự đổi vai trò của chính mình".ToMessageForUser());

        // Vai trò nằm trong token, đổi vai trò thì bắt đăng nhập lại để có quyền mới.
        if (roleChanged) await db.RevokeRefreshTokensAsync(user.Id, ct);
        user.FullName = cmd.FullName.Trim();
        user.Email = cmd.Email.NormalizeEmail();
        user.Role = cmd.Role;
        await db.SaveChangesAsync(ct);
        return UserItem.From(user);
    }
}
