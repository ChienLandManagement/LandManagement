using ErrorOr;
using LandManagement.Common.Interfaces;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.Dossiers.SaveDossier;

public record CreateDossierCommand(Guid? WardId, string Code, string ApplicantName, Guid? ParcelId, DossierStatus Status, DateOnly ReceivedDate,
    DateOnly? DueDate, DateOnly? ResolvedDate, string? Note)
    : DossierFields(Code, ApplicantName, ParcelId, Status, ReceivedDate, DueDate, ResolvedDate, Note), ICommand<DossierItem>;

public class CreateDossierValidator : DossierFieldsValidator<CreateDossierCommand>;

public class CreateDossierHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<CreateDossierCommand, ErrorOr<DossierItem>>
{
    public async Task<ErrorOr<DossierItem>> Handle(CreateDossierCommand cmd, CancellationToken ct)
    {
        var wardId = currentUser.Resolve(cmd.WardId);
        if (wardId is null) return Error.Validation("Chọn xã/phường bạn được phân công".ToMessageForUser());
        if (!await db.Wards.AnyAsync(x => x.Id == wardId, ct)) return Error.NotFound("Không tìm thấy xã/phường".ToMessageForUser());

        var check = await DossierFieldRules.CheckAsync(db, wardId.Value, cmd, ct);
        if (check.IsError) return check.Errors;
        if (await DossierFieldRules.DuplicateAsync(db, wardId.Value, cmd.Code, null, ct))
            return Error.Conflict("Xã/phường đã có hồ sơ mã này".ToMessageForUser());

        var dossier = new GcnDossier { WardId = wardId.Value };
        DossierFieldRules.Apply(dossier, cmd);
        db.GcnDossiers.Add(dossier);
        await db.SaveChangesAsync(ct);
        return DossierItem.From(await DossierFieldRules.LoadAsync(db, dossier.Id, ct));
    }
}
