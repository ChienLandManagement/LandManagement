using LandManagement.Entities;

namespace LandManagement.UseCases.Dossiers;

public record DossierItem(Guid Id, Guid WardId, string WardName, string Code, string ApplicantName, Guid? ParcelId, string? ParcelLabel, string Status,
    DateOnly ReceivedDate, DateOnly? DueDate, DateOnly? ResolvedDate, string? Note, bool IsOverdue)
{
    public static DossierItem From(GcnDossier d) => new(d.Id, d.WardId, d.Ward.Name, d.Code, d.ApplicantName, d.ParcelId,
        d.Parcel is null ? null : $"Tờ {d.Parcel.MapSheet}, thửa {d.Parcel.ParcelNumber}", d.Status.ToString(), d.ReceivedDate, d.DueDate, d.ResolvedDate, d.Note,
        DossierRules.IsOverdue(d.Status, d.DueDate));
}

public static class DossierRules
{
    // Chưa có kết quả cuối cùng.
    public static readonly DossierStatus[] OpenStatuses = [DossierStatus.Processing, DossierStatus.Backlog, DossierStatus.NeedSupplement];

    // Ngày theo giờ Việt Nam (UTC+7), dùng để xét quá hạn.
    public static DateOnly Today => DateOnly.FromDateTime(DateTime.UtcNow.AddHours(7));

    public static bool IsOverdue(DossierStatus status, DateOnly? dueDate) => OpenStatuses.Contains(status) && dueDate is { } due && due < Today;
}

public static class DossierAccess
{
    public static IQueryable<GcnDossier> InScope(this IQueryable<GcnDossier> dossiers, Security.ICurrentUser user) =>
        user.IsAdmin ? dossiers : dossiers.Where(x => user.WardIds.Contains(x.WardId));
}
