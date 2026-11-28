using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using LandManagement.UseCases.InventoryPeriods;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.LandChanges.CreateLandChange;

public class CreateLandChangeHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<CreateLandChangeCommand, ErrorOr<LandChangeItem>>
{
    public async Task<ErrorOr<LandChangeItem>> Handle(CreateLandChangeCommand cmd, CancellationToken ct)
    {
        var period = await db.InventoryPeriods.InScope(currentUser).FirstOrDefaultAsync(x => x.Id == cmd.PeriodId, ct);
        if (period is null)
            return Error.NotFound("Không tìm thấy kỳ kiểm kê".ToMessageForUser());

        var check = await LandChangeRules.CheckAsync(db, period, cmd.ChangeDate, cmd.FromLandTypeId, cmd.ToLandTypeId, cmd.HolderTypeId, ct);
        if (check.IsError) return check.Errors;

        var change = new LandChange
        {
            PeriodId = period.Id, ChangeDate = cmd.ChangeDate, FromLandTypeId = cmd.FromLandTypeId, ToLandTypeId = cmd.ToLandTypeId,
            Area = cmd.Area, HolderTypeId = cmd.HolderTypeId, Note = cmd.Note?.Trim()
        };
        db.LandChanges.Add(change);
        await db.SaveChangesAsync(ct);
        return await db.LandChanges.AsNoTracking().Include(x => x.FromLandType).Include(x => x.ToLandType).Include(x => x.HolderType)
            .Where(x => x.Id == change.Id).Select(x => LandChangeItem.From(x)).FirstAsync(ct);
    }
}
