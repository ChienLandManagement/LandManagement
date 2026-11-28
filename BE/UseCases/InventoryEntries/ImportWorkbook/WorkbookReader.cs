using System.Text;
using System.Text.RegularExpressions;
using ExcelDataReader;

namespace LandManagement.UseCases.InventoryEntries.ImportWorkbook;

// Đọc file biểu kiểm kê (.xls hoặc .xlsx): trả các dòng của từng sheet, ô là double / string / null.
public static partial class WorkbookReader
{
    // Thứ tự đối tượng ở các cột của Biểu 01 (cột 6-17 và 19-22) và Biểu 02 (cột 5-20): 12 người sử dụng, rồi 4 người được giao quản lý.
    public static readonly string[] HolderCodes = ["CNV", "CNN", "TCN", "TSN", "TXH", "TKT", "TKH", "TTG", "CDS", "TNG", "NGV", "TVN", "TCQ", "TSQ", "KTQ", "CDQ"];

    public const int CodeColumn = 2;
    public const int TotalColumn = 3;

    // Cột 0-based của đối tượng thứ i trong Biểu 01 (sau cột tổng diện tích và tổng người sử dụng) và Biểu 02.
    public static int B01Column(int i) => i < 12 ? 5 + i : 18 + (i - 12);

    public static int B02Column(int i) => 4 + i;

    static WorkbookReader() => Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

    public static Dictionary<string, List<object?[]>> Read(Stream stream)
    {
        var sheets = new Dictionary<string, List<object?[]>>();
        using var reader = ExcelReaderFactory.CreateReader(stream);
        do
        {
            var rows = new List<object?[]>();
            while (reader.Read())
            {
                var row = new object?[reader.FieldCount];
                for (var i = 0; i < row.Length; i++) row[i] = reader.GetValue(i);
                rows.Add(row);
            }

            sheets[reader.Name] = rows;
        } while (reader.NextResult());

        return sheets;
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
