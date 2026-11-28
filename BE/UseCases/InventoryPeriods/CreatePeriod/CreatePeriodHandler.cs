using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.InventoryPeriods.CreatePeriod;

public class CreatePeriodHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<CreatePeriodCommand, ErrorOr<InventoryPeriodItem>>
{
    public async Task<ErrorOr<InventoryPeriodItem>> Handle(CreatePeriodCommand cmd, CancellationToken ct)
    {
        var wardId = currentUser.Resolve(cmd.WardId);
        if (wardId is null)
            return Error.Validation("Chọn xã/phường bạn được phân công".ToMessageForUser());

        var ward = await db.Wards.FirstOrDefaultAsync(x => x.Id == wardId, ct);
        if (ward is null)
            return Error.NotFound("Không tìm thấy xã/phường".ToMessageForUser());

        if (await db.InventoryPeriods.AnyAsync(x => x.WardId == ward.Id && x.CutoffDate == cmd.CutoffDate, ct))
            return Error.Conflict("Xã/phường đã có kỳ chốt vào ngày này".ToMessageForUser());

        var period = new InventoryPeriod { WardId = ward.Id, Ward = ward, CutoffDate = cmd.CutoffDate, Type = cmd.Type, Note = cmd.Note?.Trim() };
        db.InventoryPeriods.Add(period);
        await db.SaveChangesAsync(ct);
        return InventoryPeriodItem.From(period, 0);
    }
}
