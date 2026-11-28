using ErrorOr;
using LandManagement.Data;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.Users.DeleteUser;

public class DeleteUserHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<DeleteUserCommand, ErrorOr<Success>>
{
    public async Task<ErrorOr<Success>> Handle(DeleteUserCommand cmd, CancellationToken ct)
    {
        if (cmd.Id == currentUser.Id)
            return Error.Forbidden("Không thể tự xóa tài khoản của chính mình".ToMessageForUser());

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == cmd.Id, ct);
        if (user is null) return UserRules.NotFound;

        await db.RevokeRefreshTokensAsync(user.Id, ct);
        db.Users.Remove(user); // interceptor đổi thành xóa mềm
        await db.SaveChangesAsync(ct);
        return Result.Success;
    }
}
