using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LandManagement.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddParcels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "parcels",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    ward_id = table.Column<Guid>(type: "uuid", nullable: false),
                    map_sheet = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    parcel_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    area = table.Column<decimal>(type: "numeric(18,5)", precision: 18, scale: 5, nullable: false),
                    land_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    holder_type_id = table.Column<Guid>(type: "uuid", nullable: true),
                    holder_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    note = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    last_updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    last_updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_parcels", x => x.id);
                    table.ForeignKey(
                        name: "fk_parcels_land_holder_types_holder_type_id",
                        column: x => x.holder_type_id,
                        principalTable: "land_holder_types",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_parcels_land_types_land_type_id",
                        column: x => x.land_type_id,
                        principalTable: "land_types",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_parcels_wards_ward_id",
                        column: x => x.ward_id,
                        principalTable: "wards",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_parcels_holder_type_id",
                table: "parcels",
                column: "holder_type_id");

            migrationBuilder.CreateIndex(
                name: "ix_parcels_land_type_id",
                table: "parcels",
                column: "land_type_id");

            migrationBuilder.CreateIndex(
                name: "ix_parcels_ward_id_map_sheet_parcel_number",
                table: "parcels",
                columns: new[] { "ward_id", "map_sheet", "parcel_number" },
                unique: true,
                filter: "is_deleted = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "parcels");
        }
    }
}
