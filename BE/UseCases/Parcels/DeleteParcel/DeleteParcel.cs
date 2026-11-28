using ErrorOr;
using LandManagement.Common.Interfaces;
using LandManagement.Data;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.Parcels.DeleteParcel;

public record DeleteParcelCommand(Guid Id) : ICommand;

public class DeleteParcelHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<DeleteParcelCommand, ErrorOr<Success>>
{
    public async Task<ErrorOr<Success>> Handle(DeleteParcelCommand cmd, CancellationToken ct)
    {
        var parcel = await db.Parcels.InScope(currentUser).FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
        if (parcel is null) return Error.NotFound("Không tìm thấy thửa đất".ToMessageForUser());

        db.Parcels.Remove(parcel);
        await db.SaveChangesAsync(ct);
        return Result.Success;
    }
}
