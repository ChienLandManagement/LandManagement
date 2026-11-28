using ErrorOr;
using LandManagement.Common.Interfaces;
using LandManagement.Data;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.Dossiers.DeleteDossier;

public record DeleteDossierCommand(Guid Id) : ICommand;

public class DeleteDossierHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<DeleteDossierCommand, ErrorOr<Success>>
{
    public async Task<ErrorOr<Success>> Handle(DeleteDossierCommand cmd, CancellationToken ct)
    {
        var dossier = await db.GcnDossiers.InScope(currentUser).FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
        if (dossier is null) return Error.NotFound("Không tìm thấy hồ sơ".ToMessageForUser());

        db.GcnDossiers.Remove(dossier);
        await db.SaveChangesAsync(ct);
        return Result.Success;
    }
}
