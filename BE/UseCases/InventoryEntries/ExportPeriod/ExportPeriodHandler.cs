using ClosedXML.Excel;
using ErrorOr;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LandManagement.UseCases.InventoryEntries.ExportPeriod;

// Xuất file Excel của kỳ: B01 (diện tích), B02 (số lượng), B04 (cơ cấu, tính từ B01), B05 (chu chuyển, tính từ biến động).
public class ExportPeriodHandler(AppDbContext db, ICurrentUser currentUser) : IRequestHandler<ExportPeriodQuery, ErrorOr<ExportFileItem>>
{
    private sealed record Row(LandType Type, List<LandType> Leaves);

    public async Task<ErrorOr<ExportFileItem>> Handle(ExportPeriodQuery query, CancellationToken ct)
    {
        var found = await PeriodLookup.FindAsync(db, currentUser, query.PeriodId, ct);
        if (found.IsError) return found.Errors;
        var period = found.Value;

        var tree = await CatalogTree.LoadAsync(db, ct);
        var areas = await db.LandAreaEntries.AsNoTracking().Where(x => x.PeriodId == period.Id).ToListAsync(ct);
        var counts = await db.LandHolderCountEntries.AsNoTracking().Where(x => x.PeriodId == period.Id).ToListAsync(ct);
        var changes = await db.LandChanges.AsNoTracking().Where(x => x.PeriodId == period.Id).ToListAsync(ct);
        var holders = tree.Holders.Where(h => tree.IsHolderLeaf(h.Id)).ToList();

        var areaCells = areas.ToDictionary(x => (x.LandTypeId, x.HolderTypeId), x => x.Area);
        var countCells = counts.ToDictionary(x => (x.LandTypeId, x.HolderTypeId), x => (decimal)x.Count);
        var b01 = tree.LandTypes.Select(t => new Row(t, tree.AreaLeavesUnder(t).ToList())).ToList();
        var b02 = tree.LandTypes.Where(t => t.InB02).Select(t => new Row(t, tree.CountLeavesUnder(t).ToList())).ToList();

        using var workbook = new XLWorkbook();
        WriteMatrix(workbook.AddWorksheet("B01-TKKK"), b01, holders, areaCells, "ha");
        WriteMatrix(workbook.AddWorksheet("B02-TKKKNSDĐất"), b02, holders, countCells, "số lượng");
        WriteStructure(workbook.AddWorksheet("B04-CoCau"), b01, areaCells);
        WriteTurnover(workbook.AddWorksheet("B05-CChuyen"), tree, changes);

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return new ExportFileItem(stream.ToArray(), $"kiem-ke-{period.CutoffDate:dd-MM-yyyy}.xlsx");
    }

    private static string Label(LandType t) => (t.IsMemo ? "  (trong đó) " : "") + t.Name;

    private static decimal Sum(Row row, Dictionary<(Guid, Guid), decimal> cells, Guid? holderId = null) =>
        cells.Where(c => (holderId is null || c.Key.Item2 == holderId) && row.Leaves.Any(l => l.Id == c.Key.Item1)).Sum(c => c.Value);

    private static void WriteMatrix(IXLWorksheet ws, List<Row> rows, List<LandHolderType> holders, Dictionary<(Guid, Guid), decimal> cells, string unit)
    {
        ws.Cell(1, 1).Value = "Loại đất";
        ws.Cell(1, 2).Value = "Mã";
        ws.Cell(1, 3).Value = $"Tổng ({unit})";
        for (var j = 0; j < holders.Count; j++) ws.Cell(1, 4 + j).Value = holders[j].Name;
        for (var i = 0; i < rows.Count; i++)
        {
            var r = i + 2;
            ws.Cell(r, 1).Value = Label(rows[i].Type);
            ws.Cell(r, 2).Value = rows[i].Type.Code;
            ws.Cell(r, 3).Value = Sum(rows[i], cells);
            for (var j = 0; j < holders.Count; j++) ws.Cell(r, 4 + j).Value = Sum(rows[i], cells, holders[j].Id);
        }

        Style(ws, rows.Count + 1, holders.Count + 3);
    }

    // Cơ cấu: tỷ lệ diện tích từng loại đất so với tổng diện tích tự nhiên (cộng các dòng gốc, không tính dòng "trong đó").
    private static void WriteStructure(IXLWorksheet ws, List<Row> rows, Dictionary<(Guid, Guid), decimal> cells)
    {
        ws.Cell(1, 1).Value = "Loại đất";
        ws.Cell(1, 2).Value = "Mã";
        ws.Cell(1, 3).Value = "Diện tích (ha)";
        ws.Cell(1, 4).Value = "Cơ cấu (%)";
        var grand = rows.Where(x => x.Type.ParentId == null && !x.Type.IsMemo).Sum(x => Sum(x, cells));
        for (var i = 0; i < rows.Count; i++)
        {
            var area = Sum(rows[i], cells);
            ws.Cell(i + 2, 1).Value = Label(rows[i].Type);
            ws.Cell(i + 2, 2).Value = rows[i].Type.Code;
            ws.Cell(i + 2, 3).Value = area;
            ws.Cell(i + 2, 4).Value = grand == 0 ? 0m : Math.Round(area * 100 / grand, 2);
        }

        Style(ws, rows.Count + 1, 4);
    }

    // Chu chuyển: hàng = loại đất trước, cột = loại đất sau; "Tăng khác" là hàng không có loại đất trước, "Giảm khác" là cột không có loại đất sau.
    private static void WriteTurnover(IXLWorksheet ws, CatalogTree tree, List<LandChange> changes)
    {
        var types = tree.LandTypes.Where(t => t.InB05 && !t.IsMemo).ToList();
        ws.Cell(1, 1).Value = "Từ \\ Sang";
        for (var j = 0; j < types.Count; j++) ws.Cell(1, 2 + j).Value = types[j].Code;
        ws.Cell(1, 2 + types.Count).Value = "Giảm khác";
        for (var i = 0; i <= types.Count; i++)
        {
            var from = i < types.Count ? types[i] : null;
            ws.Cell(2 + i, 1).Value = from is null ? "Tăng khác" : $"{from.Code} - {from.Name}";
            for (var j = 0; j <= types.Count; j++)
            {
                var to = j < types.Count ? types[j] : null;
                var sum = changes.Where(c => c.FromLandTypeId == from?.Id && c.ToLandTypeId == to?.Id).Sum(c => c.Area);
                if (sum != 0) ws.Cell(2 + i, 2 + j).Value = sum;
            }
        }

        Style(ws, types.Count + 2, types.Count + 2);
    }

    private static void Style(IXLWorksheet ws, int lastRow, int lastCol)
    {
        ws.Row(1).Style.Font.Bold = true;
        ws.SheetView.FreezeRows(1);
        ws.Column(1).Width = 36;
        ws.Range(1, 1, lastRow, lastCol).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        ws.Range(2, 3, lastRow, lastCol).Style.NumberFormat.Format = "#,##0.00000";
    }
}
