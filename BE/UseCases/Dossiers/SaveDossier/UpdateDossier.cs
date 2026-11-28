using ErrorOr;
using LandManagement.Common.Interfaces;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.Dossiers.SaveDossier;

public record UpdateDossierCommand(Guid Id, string Code, string ApplicantName, Guid? ParcelId, DossierStatus Status, DateOnly ReceivedDate,
    DateOnly? DueDate, DateOnly? ResolvedDate, string? Note)
    : DossierFields(Code, ApplicantName, ParcelId, Status, ReceivedDate, DueDate, ResolvedDate, Note), ICommand<DossierItem>;

public class UpdateDossierValidator : DossierFieldsValidator<UpdateDossierCommand>;

public class UpdateDossierHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<UpdateDossierCommand, ErrorOr<DossierItem>>
{
    public async Task<ErrorOr<DossierItem>> Handle(UpdateDossierCommand cmd, CancellationToken ct)
    {
        var dossier = await db.GcnDossiers.InScope(currentUser).FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
        if (dossier is null) return Error.NotFound("Không tìm thấy hồ sơ".ToMessageForUser());

        var check = await DossierFieldRules.CheckAsync(db, dossier.WardId, cmd, ct);
        if (check.IsError) return check.Errors;
        if (await DossierFieldRules.DuplicateAsync(db, dossier.WardId, cmd.Code, dossier.Id, ct))
            return Error.Conflict("Xã/phường đã có hồ sơ mã này".ToMessageForUser());

        DossierFieldRules.Apply(dossier, cmd);
        await db.SaveChangesAsync(ct);
        return DossierItem.From(await DossierFieldRules.LoadAsync(db, dossier.Id, ct));
    }
}
