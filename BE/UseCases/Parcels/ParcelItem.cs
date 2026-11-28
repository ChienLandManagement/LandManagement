using LandManagement.Entities;

namespace LandManagement.UseCases.Parcels;

/// <summary>Warnings: các thông tin còn thiếu của thửa (chưa có chủ, đối tượng, địa chỉ).</summary>
public record ParcelItem(Guid Id, Guid WardId, string WardName, string MapSheet, string ParcelNumber, decimal Area, Guid LandTypeId,
    string LandTypeCode, string LandTypeName, Guid? HolderTypeId, string? HolderTypeName, string? HolderName, string? Address, string? Note,
    List<string> Warnings)
{
    public static ParcelItem From(Parcel p)
    {
        var warnings = new List<string>();
        if (string.IsNullOrWhiteSpace(p.HolderName)) warnings.Add("Chưa có tên người sử dụng");
        if (p.HolderTypeId is null) warnings.Add("Chưa chọn đối tượng sử dụng");
        if (string.IsNullOrWhiteSpace(p.Address)) warnings.Add("Chưa có địa chỉ");
        return new ParcelItem(p.Id, p.WardId, p.Ward.Name, p.MapSheet, p.ParcelNumber, p.Area, p.LandTypeId, p.LandType.Code, p.LandType.Name,
            p.HolderTypeId, p.HolderType?.Name, p.HolderName, p.Address, p.Note, warnings);
    }
}

public static class ParcelAccess
{
    public static IQueryable<Parcel> InScope(this IQueryable<Parcel> parcels, Security.ICurrentUser user) =>
        user.IsAdmin ? parcels : parcels.Where(x => x.WardId == user.WardId);
}
