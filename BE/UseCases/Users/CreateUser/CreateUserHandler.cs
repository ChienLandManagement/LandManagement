using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using ResultLib.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Extensions;
using ResultLib.Logging;

namespace LandManagement.UseCases.Users.CreateUser;

public class CreateUserHandler(AppDbContext db, IPasswordHasher hasher) : IRequestHandler<CreateUserCommand, ErrorOr<UserItem>>
{
    public async Task<ErrorOr<UserItem>> Handle(CreateUserCommand cmd, CancellationToken ct)
    {
        var userName = cmd.UserName.Trim();
        if (await db.Users.AnyAsync(u => u.UserName.ToLower() == userName.ToLower(), ct))
            return Error.Conflict("Tên đăng nhập đã tồn tại".ToMessageForUser());

        Ward? ward = null;
        if (cmd.Role != UserRole.Admin)
        {
            if (cmd.WardId is not { } wardId)
                return Error.Validation("Chọn xã/phường".ToMessageForUser());

            ward = await db.Wards.FirstOrDefaultAsync(x => x.Id == wardId, ct);
            if (ward is null)
                return Error.Validation("Xã/phường không tồn tại".ToMessageForUser());
        }

        var user = new User
        {
            UserName = userName,
            PasswordHash = hasher.Hash(cmd.Password),
            FullName = cmd.FullName.Trim(),
            Email = cmd.Email.NormalizeEmail(),
            Role = cmd.Role,
            WardId = cmd.Role == UserRole.Admin ? null : cmd.WardId,
            Ward = ward
        };
        db.Users.Add(user);
        await db.SaveChangesAsync(ct);
        return UserItem.From(user);
    }
}
