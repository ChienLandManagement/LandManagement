using ErrorOr;
using LandManagement.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.Auth;

public class MeHandler(AppDbContext db) : IRequestHandler<MeQuery, ErrorOr<UserProfile>>
{
    public async Task<ErrorOr<UserProfile>> Handle(MeQuery query, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == query.UserId && u.IsActive, ct);
        return user is null ? Error.NotFound("Không tìm thấy tài khoản".ToMessageForUser()) : UserProfile.From(user);
    }
}
