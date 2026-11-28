using ErrorOr;
using FluentValidation;
using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using Microsoft.EntityFrameworkCore;
using ResultLib.Logging;

namespace LandManagement.UseCases.Parcels.SaveParcel;

public record ParcelFields(string MapSheet, string ParcelNumber, decimal Area, Guid LandTypeId, Guid? HolderTypeId, string? HolderName, string? Address, string? Note);

public class ParcelFieldsValidator<T> : AbstractValidator<T> where T : ParcelFields
{
    public ParcelFieldsValidator()
    {
        RuleFor(x => x.MapSheet).NotEmpty().WithMessage("Nhập số tờ bản đồ").MaximumLength(20).WithMessage("Số tờ tối đa 20 ký tự");
        RuleFor(x => x.ParcelNumber).NotEmpty().WithMessage("Nhập số thửa").MaximumLength(20).WithMessage("Số thửa tối đa 20 ký tự");
        RuleFor(x => x.Area).GreaterThan(0).WithMessage("Diện tích phải lớn hơn 0");
        RuleFor(x => x.LandTypeId).NotEmpty().WithMessage("Chọn loại đất");
        RuleFor(x => x.HolderName).MaximumLength(255).WithMessage("Tên người sử dụng tối đa 255 ký tự");
        RuleFor(x => x.Address).MaximumLength(500).WithMessage("Địa chỉ tối đa 500 ký tự");
        RuleFor(x => x.Note).MaximumLength(1000).WithMessage("Ghi chú tối đa 1000 ký tự");
    }
}

public static class ParcelRules
{
    // Loại đất phải là loại lá (nhập được ở B01) và đối tượng phải là đối tượng lá.
    public static async Task<ErrorOr<Success>> CheckAsync(AppDbContext db, ParcelFields f, CancellationToken ct)
    {
        var tree = await InventoryEntries.CatalogTree.LoadAsync(db, ct);
        if (!tree.LandTypeById.TryGetValue(f.LandTypeId, out var landType) || !tree.IsAreaLeaf(landType))
            return Error.Validation("Loại đất của thửa phải là loại đất chi tiết (không phải dòng tổng hợp)".ToMessageForUser());
        if (f.HolderTypeId is { } holderId && (!tree.HolderById.ContainsKey(holderId) || !tree.IsHolderLeaf(holderId)))
            return Error.Validation("Đối tượng sử dụng phải là đối tượng chi tiết".ToMessageForUser());
        return Result.Success;
    }

    public static void Apply(Parcel p, ParcelFields f)
    {
        p.MapSheet = f.MapSheet.Trim();
        p.ParcelNumber = f.ParcelNumber.Trim();
        p.Area = f.Area;
        p.LandTypeId = f.LandTypeId;
        p.HolderTypeId = f.HolderTypeId;
        p.HolderName = string.IsNullOrWhiteSpace(f.HolderName) ? null : f.HolderName.Trim();
        p.Address = string.IsNullOrWhiteSpace(f.Address) ? null : f.Address.Trim();
        p.Note = string.IsNullOrWhiteSpace(f.Note) ? null : f.Note.Trim();
    }

    public static Task<bool> DuplicateAsync(AppDbContext db, Guid wardId, ParcelFields f, Guid? exceptId, CancellationToken ct) =>
        db.Parcels.AnyAsync(x => x.WardId == wardId && x.MapSheet == f.MapSheet.Trim() && x.ParcelNumber == f.ParcelNumber.Trim() && x.Id != exceptId, ct);
}
