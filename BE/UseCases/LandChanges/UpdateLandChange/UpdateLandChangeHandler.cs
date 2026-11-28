using ErrorOr;
using LandManagement.Data;
using LandManagement.Security;
using LandManagement.UseCases.InventoryPeriods;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.LandChanges.UpdateLandChange;

public class UpdateLandChangeHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<UpdateLandChangeCommand, ErrorOr<LandChangeItem>>
{
    public async Task<ErrorOr<LandChangeItem>> Handle(UpdateLandChangeCommand cmd, CancellationToken ct)
    {
        var change = await db.LandChanges.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
        var period = change is null ? null : await db.InventoryPeriods.InScope(currentUser).FirstOrDefaultAsync(x => x.Id == change.PeriodId, ct);
        if (change is null || period is null)
            return Error.NotFound("Không tìm thấy biến động".ToMessageForUser());

        var check = await LandChangeRules.CheckAsync(db, period, cmd.ChangeDate, cmd.FromLandTypeId, cmd.ToLandTypeId, cmd.HolderTypeId, ct);
        if (check.IsError) return check.Errors;

        change.ChangeDate = cmd.ChangeDate;
        change.FromLandTypeId = cmd.FromLandTypeId;
        change.ToLandTypeId = cmd.ToLandTypeId;
        change.Area = cmd.Area;
        change.HolderTypeId = cmd.HolderTypeId;
        change.Note = cmd.Note?.Trim();
        await db.SaveChangesAsync(ct);
        return await db.LandChanges.AsNoTracking().Include(x => x.FromLandType).Include(x => x.ToLandType).Include(x => x.HolderType)
            .Where(x => x.Id == change.Id).Select(x => LandChangeItem.From(x)).FirstAsync(ct);
    }
}
