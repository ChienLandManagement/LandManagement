using LandManagement.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LandManagement.Data.Configurations;

public class ProvinceConfiguration : IEntityTypeConfiguration<Province>
{
    public void Configure(EntityTypeBuilder<Province> builder)
    {
        builder.ToTable("provinces");
        builder.Property(x => x.ProvinceCode).HasMaxLength(2).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(255).IsRequired();
        builder.Property(x => x.ShortName).HasMaxLength(255);
        builder.Property(x => x.PlaceType).HasMaxLength(50);
        builder.Property(x => x.Country).HasMaxLength(10);
        builder.HasIndex(x => x.ProvinceCode).IsUnique().HasFilter("is_deleted = false");
    }
}
