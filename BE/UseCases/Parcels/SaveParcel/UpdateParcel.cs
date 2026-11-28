using ErrorOr;
using LandManagement.Common.Interfaces;
using LandManagement.Data;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.Parcels.SaveParcel;

public record UpdateParcelCommand(Guid Id, string MapSheet, string ParcelNumber, decimal Area, Guid LandTypeId, Guid? HolderTypeId,
    string? HolderName, string? Address, string? Note)
    : ParcelFields(MapSheet, ParcelNumber, Area, LandTypeId, HolderTypeId, HolderName, Address, Note), ICommand<ParcelItem>;

public class UpdateParcelValidator : ParcelFieldsValidator<UpdateParcelCommand>;

public class UpdateParcelHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<UpdateParcelCommand, ErrorOr<ParcelItem>>
{
    public async Task<ErrorOr<ParcelItem>> Handle(UpdateParcelCommand cmd, CancellationToken ct)
    {
        var parcel = await db.Parcels.InScope(currentUser).FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
        if (parcel is null) return Error.NotFound("Không tìm thấy thửa đất".ToMessageForUser());

        var check = await ParcelRules.CheckAsync(db, cmd, ct);
        if (check.IsError) return check.Errors;
        if (await ParcelRules.DuplicateAsync(db, parcel.WardId, cmd, parcel.Id, ct))
            return Error.Conflict("Xã/phường đã có thửa này (cùng số tờ và số thửa)".ToMessageForUser());

        ParcelRules.Apply(parcel, cmd);
        await db.SaveChangesAsync(ct);
        var saved = await db.Parcels.AsNoTracking().Include(x => x.Ward).Include(x => x.LandType).Include(x => x.HolderType).FirstAsync(x => x.Id == parcel.Id, ct);
        return ParcelItem.From(saved);
    }
}
