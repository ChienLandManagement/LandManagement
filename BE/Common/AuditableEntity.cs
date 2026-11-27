using LandManagement.Api.Common.Exceptions;
namespace LandManagement.Api.Common;
public abstract class AuditableEntity<TId> : Entity<TId>, ISoftDelete
{
    public DateTime CreatedAt { get; protected set; } = DateTime.UtcNow;
    public Guid? CreatedBy { get; protected set; }
    public DateTime LastUpdatedAt { get; protected set; } = DateTime.UtcNow;
    public Guid? LastUpdatedBy { get; protected set; }
    public bool IsDeleted { get; protected set; }
    public void Touch(Guid? modifiedBy)
    {
        LastUpdatedAt = DateTime.UtcNow;
        LastUpdatedBy = modifiedBy;
    }
    public virtual void Delete(Guid? deletedBy)
    {
        if (IsDeleted) throw new DomainException("Đối tượng đã bị xóa trước đó.");
        IsDeleted = true;
        Touch(deletedBy);
    }
}
