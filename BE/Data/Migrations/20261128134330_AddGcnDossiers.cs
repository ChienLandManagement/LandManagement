using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LandManagement.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGcnDossiers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "gcn_dossiers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    ward_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    applicant_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    parcel_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<int>(type: "integer", nullable: false),
                    received_date = table.Column<DateOnly>(type: "date", nullable: false),
                    due_date = table.Column<DateOnly>(type: "date", nullable: true),
                    resolved_date = table.Column<DateOnly>(type: "date", nullable: true),
                    note = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    last_updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    last_updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_gcn_dossiers", x => x.id);
                    table.ForeignKey(
                        name: "fk_gcn_dossiers_parcels_parcel_id",
                        column: x => x.parcel_id,
                        principalTable: "parcels",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_gcn_dossiers_wards_ward_id",
                        column: x => x.ward_id,
                        principalTable: "wards",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_gcn_dossiers_parcel_id",
                table: "gcn_dossiers",
                column: "parcel_id");

            migrationBuilder.CreateIndex(
                name: "ix_gcn_dossiers_ward_id_code",
                table: "gcn_dossiers",
                columns: new[] { "ward_id", "code" },
                unique: true,
                filter: "is_deleted = false");

            migrationBuilder.CreateIndex(
                name: "ix_gcn_dossiers_ward_id_status",
                table: "gcn_dossiers",
                columns: new[] { "ward_id", "status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "gcn_dossiers");
        }
    }
}
