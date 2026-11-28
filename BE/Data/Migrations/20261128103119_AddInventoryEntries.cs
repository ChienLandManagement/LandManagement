using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LandManagement.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddInventoryEntries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "source",
                table: "land_changes",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateTable(
                name: "land_area_entries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    period_id = table.Column<Guid>(type: "uuid", nullable: false),
                    land_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    holder_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    area = table.Column<decimal>(type: "numeric(18,5)", precision: 18, scale: 5, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_land_area_entries", x => x.id);
                    table.ForeignKey(
                        name: "fk_land_area_entries_inventory_periods_period_id",
                        column: x => x.period_id,
                        principalTable: "inventory_periods",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_land_area_entries_land_holder_types_holder_type_id",
                        column: x => x.holder_type_id,
                        principalTable: "land_holder_types",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_land_area_entries_land_types_land_type_id",
                        column: x => x.land_type_id,
                        principalTable: "land_types",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "land_holder_count_entries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    period_id = table.Column<Guid>(type: "uuid", nullable: false),
                    land_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    holder_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    count = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_land_holder_count_entries", x => x.id);
                    table.ForeignKey(
                        name: "fk_land_holder_count_entries_inventory_periods_period_id",
                        column: x => x.period_id,
                        principalTable: "inventory_periods",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_land_holder_count_entries_land_holder_types_holder_type_id",
                        column: x => x.holder_type_id,
                        principalTable: "land_holder_types",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_land_holder_count_entries_land_types_land_type_id",
                        column: x => x.land_type_id,
                        principalTable: "land_types",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_land_area_entries_holder_type_id",
                table: "land_area_entries",
                column: "holder_type_id");

            migrationBuilder.CreateIndex(
                name: "ix_land_area_entries_land_type_id",
                table: "land_area_entries",
                column: "land_type_id");

            migrationBuilder.CreateIndex(
                name: "ix_land_area_entries_period_id_land_type_id_holder_type_id",
                table: "land_area_entries",
                columns: new[] { "period_id", "land_type_id", "holder_type_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_land_holder_count_entries_holder_type_id",
                table: "land_holder_count_entries",
                column: "holder_type_id");

            migrationBuilder.CreateIndex(
                name: "ix_land_holder_count_entries_land_type_id",
                table: "land_holder_count_entries",
                column: "land_type_id");

            migrationBuilder.CreateIndex(
                name: "ix_land_holder_count_entries_period_id_land_type_id_holder_typ",
                table: "land_holder_count_entries",
                columns: new[] { "period_id", "land_type_id", "holder_type_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "land_area_entries");

            migrationBuilder.DropTable(
                name: "land_holder_count_entries");

            migrationBuilder.DropColumn(
                name: "source",
                table: "land_changes");
        }
    }
}
