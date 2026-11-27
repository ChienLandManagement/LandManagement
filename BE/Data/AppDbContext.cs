using System.Linq.Expressions;
using System.Reflection;
using LandManagement.Api.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace LandManagement.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    private IDbContextTransaction? _currentTransaction;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            if (typeof(ISoftDelete).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var property = Expression.Property(parameter, nameof(ISoftDelete.IsDeleted));
                var condition = Expression.Equal(property, Expression.Constant(false));
                var lambda = Expression.Lambda(condition, parameter);
                builder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }

            if (typeof(Entity<Guid>).IsAssignableFrom(entityType.ClrType))
                builder.Entity(entityType.ClrType).Property("Id").ValueGeneratedNever();

            foreach (var property in entityType.GetProperties())
                if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                    property.SetValueConverter(new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>(
                        v => v.Kind == DateTimeKind.Utc ? v : DateTime.SpecifyKind(v, DateTimeKind.Utc),
                        v => DateTime.SpecifyKind(v, DateTimeKind.Utc)));
        }

        base.OnModelCreating(builder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<AuditableEntity<Guid>>())
        {
            if (entry.State == EntityState.Added)
                entry.Entity.Touch(null);

            if (entry.State == EntityState.Modified)
            {
                entry.Property(nameof(AuditableEntity<Guid>.CreatedAt)).IsModified = false;
                entry.Property(nameof(AuditableEntity<Guid>.CreatedBy)).IsModified = false;
            }

            if (entry.State == EntityState.Deleted)
            {
                entry.State = EntityState.Modified;
                entry.Entity.Delete(null);
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken ct)
    {
        _currentTransaction ??= await Database.BeginTransactionAsync(ct);
    }

    public async Task CommitTransactionAsync(CancellationToken ct)
    {
        try
        {
            await SaveChangesAsync(ct);
            if (_currentTransaction != null)
                await _currentTransaction.CommitAsync(ct);
        }
        finally
        {
            if (_currentTransaction != null)
                await _currentTransaction.DisposeAsync();
            _currentTransaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken ct)
    {
        if (_currentTransaction == null) return;
        try
        {
            await _currentTransaction.RollbackAsync(ct);
        }
        finally
        {
            await _currentTransaction.DisposeAsync();
            _currentTransaction = null;
        }
    }

}
