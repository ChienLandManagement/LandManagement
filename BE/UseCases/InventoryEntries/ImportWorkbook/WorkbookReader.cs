using System.Text.RegularExpressions;
using ClosedXML.Excel;

namespace LandManagement.UseCases.InventoryEntries.ImportWorkbook;

// Đọc file biểu kiểm kê (.xlsx): trả các dòng của từng sheet, ô là double / string / null.
public static partial class WorkbookReader
{
    // Thứ tự đối tượng ở các cột của Biểu 01 (cột 6-17 và 19-22) và Biểu 02 (cột 5-20): 12 người sử dụng, rồi 4 người được giao quản lý.
    public static readonly string[] HolderCodes = ["CNV", "CNN", "TCN", "TSN", "TXH", "TKT", "TKH", "TTG", "CDS", "TNG", "NGV", "TVN", "TCQ", "TSQ", "KTQ", "CDQ"];

    public const int CodeColumn = 2;
    public const int TotalColumn = 3;

    // Cột 0-based của đối tượng thứ i trong Biểu 01 (sau cột tổng diện tích và tổng người sử dụng) và Biểu 02.
    public static int B01Column(int i) => i < 12 ? 5 + i : 18 + (i - 12);

    public static int B02Column(int i) => 4 + i;

    public static Dictionary<string, List<object?[]>> Read(Stream stream)
    {
        using var workbook = new XLWorkbook(stream);
        return workbook.Worksheets.ToDictionary(ws => ws.Name, ws =>
        {
            var range = ws.RangeUsed();
            if (range is null) return new List<object?[]>();
            var lastCol = range.LastColumn().ColumnNumber();
            // Luôn đọc từ ô A1 (mảng 0-based, cột A = chỉ số 0) để khớp vị trí cột cố định của biểu.
            return Enumerable.Range(1, range.LastRow().RowNumber())
                .Select(r => Enumerable.Range(1, lastCol).Select(c => ToCell(ws.Cell(r, c))).ToArray())
                .ToList();
        });
    }

    private static object? ToCell(IXLCell cell)
    {
        var value = cell.Value;
        return value.IsBlank ? null : value.IsNumber ? (double)value.GetNumber() : value.ToString();
    }

    public static List<object?[]>? FindSheet(Dictionary<string, List<object?[]>> sheets, string prefix) =>
        sheets.FirstOrDefault(s => s.Key.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)).Value;

    public static decimal Number(object? cell) => cell switch
    {
        double d => (decimal)d,
        string s when decimal.TryParse(s.Trim(), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var v) => v,
        _ => 0m
    };

    public static string Text(object? cell) => cell?.ToString()?.Trim() ?? string.Empty;

    public static object? At(object?[] row, int column) => column < row.Length ? row[column] : null;

    // Dòng dữ liệu của biểu 01/02: cột "Mã" là mã loại đất gồm 3 chữ in hoa (bỏ dòng tiêu đề, dòng số thứ tự cột, dòng tổng).
    public static bool IsDataRow(object?[] row, out string code)
    {
        code = Text(At(row, CodeColumn));
        return CodeRegex().IsMatch(code);
    }

    [GeneratedRegex("^[A-Z]{3}$")]
    private static partial Regex CodeRegex();
}
