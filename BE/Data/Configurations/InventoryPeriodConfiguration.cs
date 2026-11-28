using LandManagement.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LandManagement.Data.Configurations;

public class InventoryPeriodConfiguration : IEntityTypeConfiguration<InventoryPeriod>
{
    public void Configure(EntityTypeBuilder<InventoryPeriod> builder)
    {
        builder.ToTable("inventory_periods");
        builder.Property(x => x.Note).HasMaxLength(500);
        builder.HasIndex(x => new { x.WardId, x.CutoffDate }).IsUnique().HasFilter("is_deleted = false");
        builder.HasOne(x => x.Ward).WithMany().HasForeignKey(x => x.WardId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class LandChangeConfiguration : IEntityTypeConfiguration<LandChange>
{
    public void Configure(EntityTypeBuilder<LandChange> builder)
    {
        builder.ToTable("land_changes");
        builder.Property(x => x.Area).HasPrecision(18, 5);
        builder.Property(x => x.Note).HasMaxLength(500);
        builder.Property(x => x.ReasonText).HasMaxLength(200);
        builder.HasIndex(x => x.PeriodId);
        builder.HasOne(x => x.Period).WithMany(x => x.Changes).HasForeignKey(x => x.PeriodId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.FromLandType).WithMany().HasForeignKey(x => x.FromLandTypeId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.ToLandType).WithMany().HasForeignKey(x => x.ToLandTypeId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.HolderType).WithMany().HasForeignKey(x => x.HolderTypeId).OnDelete(DeleteBehavior.Restrict);
    }
}
