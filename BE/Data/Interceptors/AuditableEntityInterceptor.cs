using ResultLib.Models;
using LandManagement.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace LandManagement.Data.Interceptors;

// Điền thông tin audit và đổi xóa cứng thành xóa mềm cho mọi entity kế thừa AuditableEntity.
public class AuditableEntityInterceptor(ICurrentUser currentUser) : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        if (eventData.Context is not null) ApplyAudit(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null) ApplyAudit(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void ApplyAudit(DbContext context)
    {
        Guid? userId = currentUser.Id == Guid.Empty ? null : currentUser.Id;

        foreach (var entry in context.ChangeTracker.Entries<AuditableEntity<Guid>>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.Touch(userId);
                    entry.Property(nameof(AuditableEntity<>.CreatedBy)).CurrentValue = userId;
                    break;
                case EntityState.Modified:
                    entry.Entity.Touch(userId);
                    entry.Property(nameof(AuditableEntity<>.CreatedAt)).IsModified = false;
                    entry.Property(nameof(AuditableEntity<>.CreatedBy)).IsModified = false;
                    break;
                case EntityState.Deleted:
                    entry.State = EntityState.Modified;
                    entry.Entity.SoftDelete(userId);
                    break;
            }
        }
    }
}