using ErrorOr;
using FluentValidation;
using LandManagement.Data;
using LandManagement.Entities;
using Microsoft.EntityFrameworkCore;
using ResultLib.Extensions;
using ResultLib.Logging;

namespace LandManagement.UseCases.Dossiers.SaveDossier;

public record DossierFields(string Code, string ApplicantName, Guid? ParcelId, DossierStatus Status, DateOnly ReceivedDate, DateOnly? DueDate,
    DateOnly? ResolvedDate, string? Note);

public class DossierFieldsValidator<T> : AbstractValidator<T> where T : DossierFields
{
    public DossierFieldsValidator()
    {
        RuleFor(x => x.Code).NotEmpty().WithMessage("Nhập mã hồ sơ").MaximumLength(50).WithMessage("Mã hồ sơ tối đa 50 ký tự");
        RuleFor(x => x.ApplicantName).NotEmpty().WithMessage("Nhập tên người nộp hồ sơ").MaximumLength(255).WithMessage("Tên người nộp tối đa 255 ký tự");
        RuleFor(x => x.Status).IsInEnum().WithMessage("Trạng thái không hợp lệ");
        RuleFor(x => x.ReceivedDate).NotEmpty().WithMessage("Chọn ngày tiếp nhận");
        RuleFor(x => x.DueDate).GreaterThanOrEqualTo(x => x.ReceivedDate).WithMessage("Hạn xử lý không được trước ngày tiếp nhận").When(x => x.DueDate != null);
        RuleFor(x => x.ResolvedDate).GreaterThanOrEqualTo(x => x.ReceivedDate).WithMessage("Ngày có kết quả không được trước ngày tiếp nhận").When(x => x.ResolvedDate != null);
        RuleFor(x => x.Note).MaximumLength(1000).WithMessage("Ghi chú tối đa 1000 ký tự");
    }
}

public static class DossierFieldRules
{
    // Thửa gắn kèm phải thuộc cùng xã với hồ sơ.
    public static async Task<ErrorOr<Success>> CheckAsync(AppDbContext db, Guid wardId, DossierFields f, CancellationToken ct)
    {
        if (f.ParcelId is { } parcelId && !await db.Parcels.AnyAsync(x => x.Id == parcelId && x.WardId == wardId, ct))
            return Error.Validation("Thửa đất không thuộc xã/phường của hồ sơ".ToMessageForUser());
        return Result.Success;
    }

    // Ngày có kết quả chỉ có khi đã cấp hoặc từ chối (không nhập thì lấy hôm nay); trạng thái khác thì bỏ.
    public static void Apply(GcnDossier d, DossierFields f)
    {
        d.Code = f.Code.Trim();
        d.ApplicantName = f.ApplicantName.Trim();
        d.ParcelId = f.ParcelId;
        d.Status = f.Status;
        d.ReceivedDate = f.ReceivedDate;
        d.DueDate = f.DueDate;
        d.ResolvedDate = f.Status is DossierStatus.Issued or DossierStatus.Rejected ? f.ResolvedDate ?? DossierRules.Today : null;
        d.Note = f.Note.IsEmpty() ? null : f.Note.Trim();
    }

    public static Task<bool> DuplicateAsync(AppDbContext db, Guid wardId, string code, Guid? exceptId, CancellationToken ct) =>
        db.GcnDossiers.AnyAsync(x => x.WardId == wardId && x.Code.ToLower() == code.Trim().ToLower() && x.Id != exceptId, ct);

    public static Task<GcnDossier> LoadAsync(AppDbContext db, Guid id, CancellationToken ct) =>
        db.GcnDossiers.AsNoTracking().Include(x => x.Ward).Include(x => x.Parcel).FirstAsync(x => x.Id == id, ct);
}
