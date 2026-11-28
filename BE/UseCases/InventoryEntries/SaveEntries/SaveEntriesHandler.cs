using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using LandManagement.UseCases.InventoryEntries.GetEntries;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.InventoryEntries.SaveEntries;

public class SaveEntriesHandler(AppDbContext db, ICurrentUser currentUser, ISender sender) : IRequestHandler<SaveEntriesCommand, ErrorOr<PeriodEntriesItem>>
{
    public async Task<ErrorOr<PeriodEntriesItem>> Handle(SaveEntriesCommand cmd, CancellationToken ct)
    {
        var found = await PeriodLookup.FindAsync(db, currentUser, cmd.PeriodId, ct);
        if (found.IsError) return found.Errors;
        var open = found.Value.RequireOpen();
        if (open.IsError) return open.Errors;

        var tree = await CatalogTree.LoadAsync(db, ct);
        foreach (var cell in cmd.Areas ?? [])
            if (Check(tree, cell.LandTypeId, cell.HolderTypeId, forCount: false) is { } err) return err;
        foreach (var cell in cmd.Counts ?? [])
            if (Check(tree, cell.LandTypeId, cell.HolderTypeId, forCount: true) is { } err) return err;

        var areas = await db.LandAreaEntries.Where(x => x.PeriodId == cmd.PeriodId).ToDictionaryAsync(x => (x.LandTypeId, x.HolderTypeId), ct);
        foreach (var cell in cmd.Areas ?? [])
        {
            var key = (cell.LandTypeId, cell.HolderTypeId);
            areas.TryGetValue(key, out var row);
            if (cell.Value is null or 0)
            {
                if (row is not null) db.LandAreaEntries.Remove(row);
            }
            else if (row is null)
                db.LandAreaEntries.Add(areas[key] = new LandAreaEntry { PeriodId = cmd.PeriodId, LandTypeId = cell.LandTypeId, HolderTypeId = cell.HolderTypeId, Area = cell.Value.Value });
            else row.Area = cell.Value.Value;
        }

        var counts = await db.LandHolderCountEntries.Where(x => x.PeriodId == cmd.PeriodId).ToDictionaryAsync(x => (x.LandTypeId, x.HolderTypeId), ct);
        foreach (var cell in cmd.Counts ?? [])
        {
            var key = (cell.LandTypeId, cell.HolderTypeId);
            counts.TryGetValue(key, out var row);
            if (cell.Value is null or 0)
            {
                if (row is not null) db.LandHolderCountEntries.Remove(row);
            }
            else if (row is null)
                db.LandHolderCountEntries.Add(counts[key] = new LandHolderCountEntry { PeriodId = cmd.PeriodId, LandTypeId = cell.LandTypeId, HolderTypeId = cell.HolderTypeId, Count = cell.Value.Value });
            else row.Count = cell.Value.Value;
        }

        await db.SaveChangesAsync(ct);
        return await sender.Send(new GetEntriesQuery(cmd.PeriodId), ct);
    }

    // Chỉ ô lá mới nhập được: dòng cha và cột nhóm là tổng, tính khi xem.
    private static Error? Check(CatalogTree tree, Guid landTypeId, Guid holderTypeId, bool forCount)
    {
        if (!tree.LandTypeById.TryGetValue(landTypeId, out var landType))
            return Error.NotFound("Không tìm thấy loại đất".ToMessageForUser());
        if (!tree.HolderById.ContainsKey(holderTypeId))
            return Error.NotFound("Không tìm thấy đối tượng sử dụng/quản lý".ToMessageForUser());
        if (!(forCount ? tree.IsCountLeaf(landType) : tree.IsAreaLeaf(landType)))
            return Error.Validation($"Loại đất {landType.Code} là dòng tổng hợp, hãy nhập ở các loại đất con".ToMessageForUser());
        if (!tree.IsHolderLeaf(holderTypeId))
            return Error.Validation($"Đối tượng {tree.HolderById[holderTypeId].Code} là cột tổng hợp, hãy nhập ở các đối tượng con".ToMessageForUser());
        return null;
    }
}
