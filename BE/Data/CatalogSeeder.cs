using System.Reflection;
using System.Text.Json;
using LandManagement.Entities;
using Microsoft.EntityFrameworkCore;

namespace LandManagement.Data;

public static class CatalogSeeder
{
    // Nạp danh mục chuẩn (Thông tư 08/2024) từ file JSON nhúng trong assembly, chỉ khi bảng còn trống.
    public static async Task SeedCatalogsAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        if (!await db.LandTypes.IgnoreQueryFilters().AnyAsync())
        {
            var rows = Read<LandTypeSeed>("danh-muc-loai-dat.json");
            var entities = rows.Select((r, i) => new LandType { Code = r.Ma, Name = r.Ten, SortOrder = i + 1, InB02 = r.CoTrongB02, InB05 = r.CoTrongB05, IsMemo = string.IsNullOrWhiteSpace(r.Stt) }).ToList();
            var byCode = entities.ToDictionary(e => e.Code);
            for (var i = 0; i < rows.Count; i++)
                if (rows[i].Cha is { } parent) entities[i].ParentId = byCode[parent].Id;
            db.LandTypes.AddRange(entities);
        }

        if (!await db.LandHolderTypes.IgnoreQueryFilters().AnyAsync())
        {
            var rows = Read<LandHolderSeed>("danh-muc-doi-tuong.json");
            var entities = rows.Select((r, i) => new LandHolderType { Code = r.Ma, Name = r.Ten, SortOrder = i + 1, Kind = r.Nhom == "QL" ? LandHolderKind.Manager : LandHolderKind.User }).ToList();
            var byCode = entities.ToDictionary(e => e.Code);
            for (var i = 0; i < rows.Count; i++)
                if (rows[i].Cha is { } parent) entities[i].ParentId = byCode[parent].Id;
            db.LandHolderTypes.AddRange(entities);
        }

        await db.SaveChangesAsync();
    }

    private static List<T> Read<T>(string fileName)
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resource = assembly.GetManifestResourceNames().Single(n => n.EndsWith(fileName, StringComparison.OrdinalIgnoreCase));
        using var stream = assembly.GetManifestResourceStream(resource)!;
        return JsonSerializer.Deserialize<List<T>>(stream, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
    }

    private record LandTypeSeed(string? Stt, string Ma, string Ten, string? Cha, bool CoTrongB02, bool CoTrongB05);

    private record LandHolderSeed(string Ma, string Ten, string Nhom, string? Cha);
}
