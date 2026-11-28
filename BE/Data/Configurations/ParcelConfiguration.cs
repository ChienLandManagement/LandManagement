using LandManagement.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LandManagement.Data.Configurations;

public class ParcelConfiguration : IEntityTypeConfiguration<Parcel>
{
    public void Configure(EntityTypeBuilder<Parcel> builder)
    {
        builder.ToTable("parcels");
        builder.Property(x => x.MapSheet).HasMaxLength(20).IsRequired();
        builder.Property(x => x.ParcelNumber).HasMaxLength(20).IsRequired();
        builder.Property(x => x.Area).HasPrecision(18, 5);
        builder.Property(x => x.HolderName).HasMaxLength(255);
        builder.Property(x => x.Address).HasMaxLength(500);
        builder.Property(x => x.Note).HasMaxLength(1000);
        builder.HasIndex(x => new { x.WardId, x.MapSheet, x.ParcelNumber }).IsUnique().HasFilter("is_deleted = false");
        builder.HasOne(x => x.Ward).WithMany().HasForeignKey(x => x.WardId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.LandType).WithMany().HasForeignKey(x => x.LandTypeId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.HolderType).WithMany().HasForeignKey(x => x.HolderTypeId).OnDelete(DeleteBehavior.Restrict);
    }
}
