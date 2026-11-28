using LandManagement.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LandManagement.Data.Configurations;

public class WardConfiguration : IEntityTypeConfiguration<Ward>
{
    public void Configure(EntityTypeBuilder<Ward> builder)
    {
        builder.ToTable("wards");
        builder.Property(x => x.WardCode).HasMaxLength(6).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(255).IsRequired();
        builder.HasIndex(x => x.WardCode).IsUnique().HasFilter("is_deleted = false");
        builder.HasOne(x => x.Province).WithMany(x => x.Wards).HasForeignKey(x => x.ProvinceId).OnDelete(DeleteBehavior.Restrict);
    }
}
