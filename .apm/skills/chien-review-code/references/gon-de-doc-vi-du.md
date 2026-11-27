# Gọn dễ đọc · Ví dụ trước / sau

Dùng cho B16 trong `SKILL.md`. Số câu trong ngoặc là câu hỏi của B16.


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

