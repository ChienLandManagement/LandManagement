using LandManagement.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LandManagement.Data.Configurations;

public class LandAreaEntryConfiguration : IEntityTypeConfiguration<LandAreaEntry>
{
    public void Configure(EntityTypeBuilder<LandAreaEntry> builder)
    {
        builder.ToTable("land_area_entries");
        builder.Property(x => x.Area).HasPrecision(18, 5);
        builder.HasIndex(x => new { x.PeriodId, x.LandTypeId, x.HolderTypeId }).IsUnique();
        builder.HasOne<InventoryPeriod>().WithMany().HasForeignKey(x => x.PeriodId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne<LandType>().WithMany().HasForeignKey(x => x.LandTypeId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<LandHolderType>().WithMany().HasForeignKey(x => x.HolderTypeId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class LandHolderCountEntryConfiguration : IEntityTypeConfiguration<LandHolderCountEntry>
{
    public void Configure(EntityTypeBuilder<LandHolderCountEntry> builder)
    {
        builder.ToTable("land_holder_count_entries");
        builder.HasIndex(x => new { x.PeriodId, x.LandTypeId, x.HolderTypeId }).IsUnique();
        builder.HasOne<InventoryPeriod>().WithMany().HasForeignKey(x => x.PeriodId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne<LandType>().WithMany().HasForeignKey(x => x.LandTypeId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<LandHolderType>().WithMany().HasForeignKey(x => x.HolderTypeId).OnDelete(DeleteBehavior.Restrict);
    }
}
