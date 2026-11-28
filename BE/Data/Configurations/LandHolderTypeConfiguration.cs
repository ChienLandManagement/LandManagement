using LandManagement.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LandManagement.Data.Configurations;

public class LandHolderTypeConfiguration : IEntityTypeConfiguration<LandHolderType>
{
    public void Configure(EntityTypeBuilder<LandHolderType> builder)
    {
        builder.ToTable("land_holder_types");
        builder.Property(x => x.Code).HasMaxLength(10).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(255).IsRequired();
        builder.Property(x => x.Kind).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.HasIndex(x => x.Code).IsUnique().HasFilter("is_deleted = false");
        builder.HasOne(x => x.Parent).WithMany(x => x.Children).HasForeignKey(x => x.ParentId).OnDelete(DeleteBehavior.Restrict);
    }
}
