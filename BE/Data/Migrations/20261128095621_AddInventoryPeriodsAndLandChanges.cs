using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LandManagement.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddInventoryPeriodsAndLandChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "inventory_periods",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    ward_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cutoff_date = table.Column<DateOnly>(type: "date", nullable: false),
                    type = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false),
                    note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    last_updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    last_updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_inventory_periods", x => x.id);
                    table.ForeignKey(
                        name: "fk_inventory_periods_wards_ward_id",
                        column: x => x.ward_id,
                        principalTable: "wards",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "land_changes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    period_id = table.Column<Guid>(type: "uuid", nullable: false),
                    change_date = table.Column<DateOnly>(type: "date", nullable: false),
                    from_land_type_id = table.Column<Guid>(type: "uuid", nullable: true),
                    to_land_type_id = table.Column<Guid>(type: "uuid", nullable: true),
                    area = table.Column<decimal>(type: "numeric(18,5)", precision: 18, scale: 5, nullable: false),
                    holder_type_id = table.Column<Guid>(type: "uuid", nullable: true),
                    note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    last_updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    last_updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_land_changes", x => x.id);
                    table.ForeignKey(
                        name: "fk_land_changes_inventory_periods_period_id",
                        column: x => x.period_id,
                        principalTable: "inventory_periods",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_land_changes_land_holder_types_holder_type_id",
                        column: x => x.holder_type_id,
                        principalTable: "land_holder_types",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_land_changes_land_types_from_land_type_id",
                        column: x => x.from_land_type_id,
                        principalTable: "land_types",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_land_changes_land_types_to_land_type_id",
                        column: x => x.to_land_type_id,
                        principalTable: "land_types",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_inventory_periods_ward_id_cutoff_date",
                table: "inventory_periods",
                columns: new[] { "ward_id", "cutoff_date" },
                unique: true,
                filter: "is_deleted = false");

            migrationBuilder.CreateIndex(
                name: "ix_land_changes_from_land_type_id",
                table: "land_changes",
                column: "from_land_type_id");

            migrationBuilder.CreateIndex(
                name: "ix_land_changes_holder_type_id",
                table: "land_changes",
                column: "holder_type_id");

            migrationBuilder.CreateIndex(
                name: "ix_land_changes_period_id",
                table: "land_changes",
                column: "period_id");

            migrationBuilder.CreateIndex(
                name: "ix_land_changes_to_land_type_id",
                table: "land_changes",
                column: "to_land_type_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "land_changes");

            migrationBuilder.DropTable(
                name: "inventory_periods");
        }
    }
}
