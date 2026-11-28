using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
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

        Ward? ward = null;
        if (cmd.Role != UserRole.Admin)
        {
            if (cmd.WardId is not { } wardId)
                return Error.Validation("Chọn xã/phường".ToMessageForUser());

            ward = await db.Wards.FirstOrDefaultAsync(x => x.Id == wardId, ct);
            if (ward is null)
                return Error.Validation("Xã/phường không tồn tại".ToMessageForUser());
        }

        // Vai trò và xã nằm trong token, đổi một trong hai thì bắt đăng nhập lại để có quyền mới.
        var newWardId = cmd.Role == UserRole.Admin ? null : cmd.WardId;
        if (roleChanged || newWardId != user.WardId) await db.RevokeRefreshTokensAsync(user.Id, ct);
        user.FullName = cmd.FullName.Trim();
        user.Email = cmd.Email.NormalizeEmail();
        user.Role = cmd.Role;
        user.WardId = newWardId;
        user.Ward = ward;
        await db.SaveChangesAsync(ct);
        return UserItem.From(user);
    }
}
