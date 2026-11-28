using ResultLib.Models;

namespace LandManagement.Entities;

// Đang xử lý, Tồn (chưa giải quyết xong, kéo dài), Đã cấp GCN, Từ chối, Cần bổ sung hồ sơ.
public enum DossierStatus { Processing = 1, Backlog = 2, Issued = 3, Rejected = 4, NeedSupplement = 5 }

// Hồ sơ cấp Giấy chứng nhận của một xã. Mã hồ sơ là khóa nghiệp vụ trong xã; có thể gắn với một thửa đất.
public class GcnDossier : AuditableEntity<Guid>
{
    public GcnDossier() => Id = Guid.CreateVersion7();

    public Guid WardId { get; set; }
    public Ward Ward { get; set; } = null!;
    public string Code { get; set; } = string.Empty;
    public string ApplicantName { get; set; } = string.Empty;
    public Guid? ParcelId { get; set; }
    public Parcel? Parcel { get; set; }
    public DossierStatus Status { get; set; } = DossierStatus.Processing;
    public DateOnly ReceivedDate { get; set; }
    public DateOnly? DueDate { get; set; }

    /// <summary>Ngày có kết quả: chỉ có khi đã cấp hoặc từ chối.</summary>
    public DateOnly? ResolvedDate { get; set; }
    public string? Note { get; set; }
}
