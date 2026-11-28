using ErrorOr;
using LandManagement.Common;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using ResultLib.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.Auth.Login;

public class LoginHandler(AppDbContext db, IPasswordHasher hasher, ITokenService tokens) : IRequestHandler<LoginCommand, ErrorOr<AuthResult>>
{
    public async Task<ErrorOr<AuthResult>> Handle(LoginCommand cmd, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.UserName == cmd.UserName, ct);
        var failReason = user is null ? LoginFailReason.UserNotFound
            : !user.IsActive ? LoginFailReason.Inactive
            : !hasher.Verify(cmd.Password, user.PasswordHash) ? LoginFailReason.WrongPassword
            : (LoginFailReason?)null;

        var device = DeviceInfoParser.Parse(cmd.UserAgent);
        db.LoginLogs.Add(new LoginLog
        {
            UserName = cmd.UserName,
            Result = failReason is null ? LoginResult.Success : LoginResult.Failed,
            FailReason = failReason,
            IpAddress = cmd.Ip,
            UserAgent = cmd.UserAgent?.Length > 512 ? cmd.UserAgent[..512] : cmd.UserAgent,
            Browser = device.Browser,
            Os = device.Os,
            DeviceType = device.DeviceType,
            UserId = user?.Id
        });

        if (failReason is not null)
        {
            await db.SaveChangesAsync(ct);
            return Error.Unauthorized("Sai tên đăng nhập hoặc mật khẩu".ToMessageForUser());
        }

        var (result, refreshToken) = tokens.CreateSession(user!, cmd.Ip, cmd.UserAgent);
        db.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync(ct);
        return result;
    }
}
