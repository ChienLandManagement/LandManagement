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
        var user = await db.Users.Include(u => u.Wards).FirstOrDefaultAsync(u => u.Id == cmd.Id, ct);
        if (user is null) return UserRules.NotFound;

        var roleChanged = user.Role != cmd.Role;
        if (roleChanged && user.Id == currentUser.Id)
            return Error.Forbidden("Không thể tự đổi vai trò của chính mình".ToMessageForUser());

        if (roleChanged && cmd.Role == UserRole.Admin)
            return Error.Forbidden("Không thể nâng tài khoản lên Admin".ToMessageForUser());

        var wards = new List<Ward>();
        if (cmd.Role != UserRole.Admin)
        {
            var wardIds = cmd.WardIds?.Distinct().ToList() ?? [];
            wards = await db.Wards.Where(x => wardIds.Contains(x.Id)).ToListAsync(ct);
            if (wards.Count != wardIds.Count)
                return Error.Validation("Có xã/phường không tồn tại".ToMessageForUser());
        }

        // Vai trò và các xã nằm trong token, đổi một trong hai thì bắt đăng nhập lại để có quyền mới.
        var wardsChanged = !user.Wards.Select(x => x.Id).OrderBy(x => x).SequenceEqual(wards.Select(x => x.Id).OrderBy(x => x));
        if (roleChanged || wardsChanged) await db.RevokeRefreshTokensAsync(user.Id, ct);
        user.FullName = cmd.FullName.Trim();
        user.Email = cmd.Email.NormalizeEmail();
        user.Role = cmd.Role;
        user.Wards = wards;
        await db.SaveChangesAsync(ct);
        return UserItem.From(user);
    }
}
