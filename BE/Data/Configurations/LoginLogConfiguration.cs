using LandManagement.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LandManagement.Data.Configurations;

public class LoginLogConfiguration : IEntityTypeConfiguration<LoginLog>
{
    public void Configure(EntityTypeBuilder<LoginLog> builder)
    {
        builder.ToTable("login_logs");
        builder.Property(x => x.UserName).HasMaxLength(255).IsRequired();
        builder.Property(x => x.Result).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.FailReason).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.DeviceType).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.IpAddress).HasMaxLength(64);
        builder.Property(x => x.UserAgent).HasMaxLength(512);
        builder.Property(x => x.Browser).HasMaxLength(100);
        builder.Property(x => x.Os).HasMaxLength(100);
        builder.HasIndex(x => x.CreatedAt);
        builder.HasIndex(x => x.UserId);
    }
}
