using ErrorOr;
using LandManagement.Common.Interfaces;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.Parcels.SaveParcel;

public record CreateParcelCommand(Guid? WardId, string MapSheet, string ParcelNumber, decimal Area, Guid LandTypeId, Guid? HolderTypeId,
    string? HolderName, string? Address, string? Note)
    : ParcelFields(MapSheet, ParcelNumber, Area, LandTypeId, HolderTypeId, HolderName, Address, Note), ICommand<ParcelItem>;

public class CreateParcelValidator : ParcelFieldsValidator<CreateParcelCommand>;

public class CreateParcelHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<CreateParcelCommand, ErrorOr<ParcelItem>>
{
    public async Task<ErrorOr<ParcelItem>> Handle(CreateParcelCommand cmd, CancellationToken ct)
    {
        var wardId = currentUser.IsAdmin ? cmd.WardId : currentUser.WardId;
        if (wardId is null) return Error.Validation("Chọn xã/phường".ToMessageForUser());
        if (!await db.Wards.AnyAsync(x => x.Id == wardId, ct)) return Error.NotFound("Không tìm thấy xã/phường".ToMessageForUser());

        var check = await ParcelRules.CheckAsync(db, cmd, ct);
        if (check.IsError) return check.Errors;
        if (await ParcelRules.DuplicateAsync(db, wardId.Value, cmd, null, ct))
            return Error.Conflict("Xã/phường đã có thửa này (cùng số tờ và số thửa)".ToMessageForUser());

        var parcel = new Parcel { WardId = wardId.Value };
        ParcelRules.Apply(parcel, cmd);
        db.Parcels.Add(parcel);
        await db.SaveChangesAsync(ct);
        var saved = await db.Parcels.AsNoTracking().Include(x => x.Ward).Include(x => x.LandType).Include(x => x.HolderType).FirstAsync(x => x.Id == parcel.Id, ct);
        return ParcelItem.From(saved);
    }
}
