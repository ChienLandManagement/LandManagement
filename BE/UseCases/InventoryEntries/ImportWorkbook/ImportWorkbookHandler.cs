using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;
using static LandManagement.UseCases.InventoryEntries.ImportWorkbook.WorkbookReader;

namespace LandManagement.UseCases.InventoryEntries.ImportWorkbook;

// Nhập số liệu một kỳ từ file biểu (sheet B01, B02, B05). Sheet nào có thì thay số liệu cũ của phần đó.
public class ImportWorkbookHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<ImportWorkbookCommand, ErrorOr<ImportResultItem>>
{
    private const decimal AreaTolerance = 0.005m;

    public async Task<ErrorOr<ImportResultItem>> Handle(ImportWorkbookCommand cmd, CancellationToken ct)
    {
        var found = await PeriodLookup.FindAsync(db, currentUser, cmd.PeriodId, ct);
        if (found.IsError) return found.Errors;
        var open = found.Value.RequireOpen();
        if (open.IsError) return open.Errors;
        var period = found.Value;

        Dictionary<string, List<object?[]>> sheets;
        try
        {
            await using var stream = cmd.File.OpenReadStream();
            sheets = Read(stream);
        }
        catch (Exception)
        {
            return Error.Validation("Không đọc được file Excel, kiểm tra lại định dạng file".ToMessageForUser());
        }

        var b01 = FindSheet(sheets, "B01");
        var b02 = FindSheet(sheets, "B02");
        var b05 = FindSheet(sheets, "B05");
        if (b01 is null && b02 is null && b05 is null)
            return Error.Validation("Không thấy sheet B01, B02 hay B05 trong file".ToMessageForUser());

        var tree = await CatalogTree.LoadAsync(db, ct);
        var holders = HolderCodes.Select(code => tree.Holders.FirstOrDefault(h => h.Code.Equals(code, StringComparison.OrdinalIgnoreCase))).OfType<LandHolderType>().ToList();
        if (holders.Count != HolderCodes.Length)
            return Error.Validation("Danh mục đối tượng thiếu mã dùng trong biểu, kiểm tra lại danh mục".ToMessageForUser());

        var warnings = new List<string>();
        var areas = b01 is null ? [] : ParseAreas(b01, tree, holders, period.Id, warnings);
        var counts = b02 is null ? [] : ParseCounts(b02, tree, holders, period.Id, warnings);
        var changes = b05 is null ? [] : ParseChanges(b05, tree, period, warnings);

        await db.BeginTransactionAsync(ct);
        try
        {
            if (b01 is not null) await db.LandAreaEntries.Where(x => x.PeriodId == period.Id).ExecuteDeleteAsync(ct);
            if (b02 is not null) await db.LandHolderCountEntries.Where(x => x.PeriodId == period.Id).ExecuteDeleteAsync(ct);
            if (b05 is not null)
                db.LandChanges.RemoveRange(await db.LandChanges.Where(x => x.PeriodId == period.Id && x.Source == LandChangeSource.Import).ToListAsync(ct));

            db.LandAreaEntries.AddRange(areas);
            db.LandHolderCountEntries.AddRange(counts);
            db.LandChanges.AddRange(changes);
            await db.SaveChangesAsync(ct);
            await db.CommitTransactionAsync(ct);
        }
        catch
        {
            await db.RollbackTransactionAsync(ct);
            throw;
        }

        return new ImportResultItem(areas.Count, counts.Count, changes.Count, warnings);
    }

    private static List<LandAreaEntry> ParseAreas(List<object?[]> rows, CatalogTree tree, List<LandHolderType> holders, Guid periodId, List<string> warnings)
    {
        var entries = new List<LandAreaEntry>();
        var leafTotals = new Dictionary<Guid, decimal>();
        var parentTotals = new Dictionary<LandType, decimal>();
        foreach (var row in rows)
        {
            if (!IsDataRow(row, out var code)) continue;
            if (!tree.LandTypeByCode.TryGetValue(code, out var type))
            {
                warnings.Add($"B01: mã {code} không có trong danh mục loại đất, bỏ qua");
                continue;
            }

            var fileTotal = Number(At(row, TotalColumn));
            if (!tree.IsAreaLeaf(type))
            {
                parentTotals[type] = fileTotal;
                continue;
            }

            var sum = 0m;
            for (var i = 0; i < holders.Count; i++)
            {
                var value = Math.Round(Number(At(row, B01Column(i))), 5);
                if (value <= 0) continue;
                entries.Add(new LandAreaEntry { PeriodId = periodId, LandTypeId = type.Id, HolderTypeId = holders[i].Id, Area = value });
                sum += value;
            }

            leafTotals[type.Id] = sum;
            if (Math.Abs(sum - fileTotal) > AreaTolerance)
                warnings.Add($"B01 {code}: cộng các cột đối tượng = {sum:0.#####}, khác tổng diện tích trong file = {fileTotal:0.#####}");
        }

        foreach (var (type, fileTotal) in parentTotals)
        {
            var computed = tree.AreaLeavesUnder(type).Sum(l => leafTotals.GetValueOrDefault(l.Id));
            if (Math.Abs(computed - fileTotal) > AreaTolerance)
                warnings.Add($"B01 {type.Code}: cộng các loại đất con = {computed:0.#####}, khác số trong file = {fileTotal:0.#####}");
        }

        return entries;
    }

    private static List<LandHolderCountEntry> ParseCounts(List<object?[]> rows, CatalogTree tree, List<LandHolderType> holders, Guid periodId, List<string> warnings)
    {
        var entries = new List<LandHolderCountEntry>();
        var leafTotals = new Dictionary<Guid, decimal>();
        var parentTotals = new Dictionary<LandType, decimal>();
        foreach (var row in rows)
        {
            if (!IsDataRow(row, out var code)) continue;
            if (!tree.LandTypeByCode.TryGetValue(code, out var type) || !type.InB02)
            {
                warnings.Add($"B02: mã {code} không có dòng ở Biểu 02 trong danh mục, bỏ qua");
                continue;
            }

            var fileTotal = Number(At(row, TotalColumn));
            if (!tree.IsCountLeaf(type))
            {
                parentTotals[type] = fileTotal;
                continue;
            }

            var sum = 0m;
            for (var i = 0; i < holders.Count; i++)
            {
                var value = (int)Math.Round(Number(At(row, B02Column(i))));
                if (value <= 0) continue;
                entries.Add(new LandHolderCountEntry { PeriodId = periodId, LandTypeId = type.Id, HolderTypeId = holders[i].Id, Count = value });
                sum += value;
            }

            leafTotals[type.Id] = sum;
            if (sum != fileTotal)
                warnings.Add($"B02 {code}: cộng các cột đối tượng = {sum:0.#####}, khác tổng số trong file = {fileTotal:0.#####}");
        }

        foreach (var (type, fileTotal) in parentTotals)
        {
            var computed = tree.CountLeavesUnder(type).Sum(l => leafTotals.GetValueOrDefault(l.Id));
            if (computed != fileTotal)
                warnings.Add($"B02 {type.Code}: cộng các loại đất con = {computed:0.#####}, khác số trong file = {fileTotal:0.#####}");
        }

        return entries;
    }

    // Biểu 05: hàng là loại đất kỳ trước, cột là loại đất kỳ sau. Đường chéo (giữ nguyên) không phải biến động nên bỏ qua.
    private static List<LandChange> ParseChanges(List<object?[]> rows, CatalogTree tree, InventoryPeriod period, List<string> warnings)
    {
        var changes = new List<LandChange>();
        var headerIndex = rows.FindIndex(r => Text(At(r, CodeColumn)) == "Mã" && IsCode(Text(At(r, 4))));
        if (headerIndex < 0)
        {
            warnings.Add("B05: không tìm thấy dòng tiêu đề (cột Mã), bỏ qua biểu này");
            return changes;
        }

        var header = rows[headerIndex];
        var columns = new List<(int Index, LandType? Type)>();
        var lossColumn = -1;
        for (var c = 4; c < header.Length; c++)
        {
            var text = Text(header[c]);
            if (IsCode(text)) columns.Add((c, tree.LandTypeByCode.GetValueOrDefault(text)));
            else if (text.StartsWith("Giảm khác", StringComparison.OrdinalIgnoreCase)) lossColumn = c;
        }

        foreach (var row in rows.Skip(headerIndex + 1))
        {
            var isGain = Text(At(row, 1)).StartsWith("Tăng khác", StringComparison.OrdinalIgnoreCase);
            LandType? from = null;
            if (!isGain)
            {
                if (!IsDataRow(row, out var code)) continue;
                if (!tree.LandTypeByCode.TryGetValue(code, out from) || !from.InB05 || from.IsMemo)
                {
                    warnings.Add($"B05: mã {code} không dùng ở Biểu 05 trong danh mục, bỏ qua dòng");
                    continue;
                }
            }

            var rowSum = 0m;
            foreach (var (index, to) in columns)
            {
                var value = Math.Round(Number(At(row, index)), 5);
                if (value <= 0) continue;
                rowSum += value;
                if (to is null)
                    warnings.Add($"B05: cột {Text(header[index])} không có trong danh mục, bỏ qua {value:0.#####} ha");
                else if (from?.Id != to.Id)
                    changes.Add(NewChange(period, from?.Id, to.Id, value));
            }

            if (from is null) continue;
            var loss = lossColumn >= 0 ? Math.Round(Number(At(row, lossColumn)), 5) : 0m;
            if (loss > 0)
            {
                rowSum += loss;
                changes.Add(NewChange(period, from.Id, null, loss));
            }

            var fileTotal = Number(At(row, TotalColumn));
            if (fileTotal > 0 && Math.Abs(rowSum - fileTotal) > AreaTolerance)
                warnings.Add($"B05 {from.Code}: cộng các cột = {rowSum:0.#####}, khác diện tích kỳ trước trong file = {fileTotal:0.#####}");
        }

        return changes;
    }

    private static LandChange NewChange(InventoryPeriod period, Guid? fromId, Guid? toId, decimal area) => new()
    {
        PeriodId = period.Id, ChangeDate = period.CutoffDate, FromLandTypeId = fromId, ToLandTypeId = toId,
        Area = area, Source = LandChangeSource.Import, Note = "Import Biểu 05"
    };

    private static bool IsCode(string text) => text.Length == 3 && text.All(char.IsAsciiLetterUpper);
}
