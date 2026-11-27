using ErrorOr;
using LandManagement.Common.Interfaces;
using LandManagement.Data;
using MediatR;
using ResultLib.Logging;
using Microsoft.EntityFrameworkCore;

namespace LandManagement.UseCases.Auth;

public record MeQuery(Guid UserId) : IQuery<UserProfile>;

public class MeHandler(AppDbContext db) : IRequestHandler<MeQuery, ErrorOr<UserProfile>>
{
    public async Task<ErrorOr<UserProfile>> Handle(MeQuery query, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == query.UserId && u.IsActive, ct);
        return user is null ? Error.NotFound("Không tìm thấy tài khoản".ToMessageForUser()) : UserProfile.From(user);
    }
}
