using LandManagement.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LandManagement.Data.Configurations;

public class GcnDossierConfiguration : IEntityTypeConfiguration<GcnDossier>
{
    public void Configure(EntityTypeBuilder<GcnDossier> builder)
    {
        builder.ToTable("gcn_dossiers");
        builder.Property(x => x.Code).HasMaxLength(50).IsRequired();
        builder.Property(x => x.ApplicantName).HasMaxLength(255).IsRequired();
        builder.Property(x => x.Note).HasMaxLength(1000);
        builder.HasIndex(x => new { x.WardId, x.Code }).IsUnique().HasFilter("is_deleted = false");
        builder.HasIndex(x => new { x.WardId, x.Status });
        builder.HasOne(x => x.Ward).WithMany().HasForeignKey(x => x.WardId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Parcel).WithMany().HasForeignKey(x => x.ParcelId).OnDelete(DeleteBehavior.Restrict);
    }
}
