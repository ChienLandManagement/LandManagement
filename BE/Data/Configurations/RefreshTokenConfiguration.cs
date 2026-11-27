using LandManagement.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LandManagement.Data.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("refresh_tokens");
        builder.Property(x => x.Browser).HasMaxLength(100);
        builder.Property(x => x.Os).HasMaxLength(100);
        builder.Property(x => x.DeviceType).HasConversion<string>().HasMaxLength(20);
        builder.Ignore(x => x.IsActive);
        builder.Property(x => x.TokenHash).HasMaxLength(64).IsRequired();
        builder.Property(x => x.ReplacedByHash).HasMaxLength(64);
        builder.Property(x => x.CreatedByIp).HasMaxLength(45);
        builder.HasIndex(x => x.TokenHash).IsUnique();
        builder.HasIndex(x => x.UserId);
    }
}
