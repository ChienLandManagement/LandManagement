using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
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

        var user = new User
        {
            UserName = userName,
            PasswordHash = hasher.Hash(cmd.Password),
            FullName = cmd.FullName.Trim(),
            Email = cmd.Email.NormalizeEmail(),
            Role = cmd.Role
        };
        db.Users.Add(user);
        await db.SaveChangesAsync(ct);
        return UserItem.From(user);
    }
}
