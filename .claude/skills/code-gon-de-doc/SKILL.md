---
name: code-gon-de-doc
description: Tự rà diff C# trước khi báo xong theo gọn dễ đọc - gộp xử lý bị tách đôi, dùng helper có sẵn, bỏ biến / nhánh / phép gọi thừa. Gọi khi sắp báo xong task có sửa file .cs, hoặc khi review diff .cs.
---

# Tự rà code C# mới theo gọn dễ đọc

Chỉ rà **dòng bạn vừa thêm hoặc sửa**. Code cũ rườm rà thì ghi vào báo cáo, không sửa.

## 5 câu hỏi

1. Có xử lý nào đang bị tách làm hai chỗ không? (hai vòng lặp trên cùng tập; hai lần parse cùng nguồn; hai nhánh giống nhau chỉ khác một giá trị; log / return lỗi rải nhiều nơi)
2. Có helper sẵn mà tôi chưa dùng không? (helper trong dự án hoặc thư viện đang dùng)
3. Có dòng nào vừa ~120 ký tự mà đang xuống ba dòng, hoặc khối một câu đang có `{ }` thừa không? Ngược lại: có khối từ hai câu mà bỏ `{ }`, hoặc lồng quá 2 tầng không ngoặc không?
4. Có biến, nhánh, tham số hay phép gọi nào tôi vừa thêm mà không dùng, không bao giờ chạy, hoặc lặp cùng kết quả không? Có `!Any()` trên collection có `Count`, hoặc `if` lọc bên trong `foreach` thay vì `.Where` không?
5. Comment tôi viết còn đúng với code hiện tại không, và có nói vì sao thay vì lặp lại code không? Có namespace viết đủ dù đã có `using` không?

**Xong khi:** báo cáo của bạn có đúng một dòng `gọn dễ đọc: câu 1–5 đã rà, sửa N chỗ` (N = số chỗ đã sửa sau khi rà; 0 nếu không có).

## Ví dụ trước / sau

**Gộp một việc bị tách đôi** (câu 1): đổi giá trị một lần, rồi suy kiểu cột từ kết quả.

```csharp
// Trước: hai vòng lặp trên cùng tập, mỗi vòng xử lý JsonElement một lần
foreach (var kv in values) dt.Columns.Add(kv.Key, kv.Value is JsonElement e ? TypeOf(e) : kv.Value?.GetType() ?? typeof(string));
foreach (var kv in values) row[kv.Key] = kv.Value is JsonElement e ? ValueOf(e) : kv.Value ?? DBNull.Value;

// Sau: đổi một lần
var converted = values.ToDictionary(kv => kv.Key, kv => ToColumnValue(kv.Value));
foreach (var (name, value) in converted) dt.Columns.Add(name, value?.GetType() ?? typeof(string));
dt.Rows.Add(converted.Values.Select(v => v ?? DBNull.Value).ToArray());
```

**Helper sẵn, một dòng** (câu 2, 3):

```csharp
// Trước
var table = !string.IsNullOrWhiteSpace(c.TargetTable)
    ? c.TargetTable.Trim()
    : "";

// Sau
var table = c.TargetTable.IsEmpty() ? "" : c.TargetTable.Trim();
```

**Count, Where, bỏ ngoặc thừa** (câu 3, 4):

```csharp
// Trước
if (!dict.Any())
{
    foreach (var item in payload)
    {
        if (!item.Key.Equals("PrimaryKey", StringComparison.OrdinalIgnoreCase))
        {
            dict[item.Key] = item.Value;
        }
    }
}

// Sau
if (dict.Count == 0)
    foreach (var item in payload.Where(p => !p.Key.Equals("PrimaryKey", StringComparison.OrdinalIgnoreCase)))
        dict[item.Key] = item.Value;
```

**Log lỗi rải nhiều nơi** (câu 1): một hàm `Fail(message, details = null)` vừa log vừa trả kết quả lỗi, mọi nhánh lỗi gọi hàm đó.

## Khi review (reviewer)

Đếm vi phạm của 5 câu trên **chỉ ở dòng thêm / sửa của diff**: mỗi nhóm vi phạm là một finding MEDIUM. Code cũ không thuộc diff chỉ ghi chú.
Không đặt chỉ tiêu số dòng: "gọn" nghĩa là đọc một lần hiểu, không phải giấu xử lý vào helper khó đọc.
