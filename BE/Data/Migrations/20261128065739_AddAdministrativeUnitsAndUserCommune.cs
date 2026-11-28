using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LandManagement.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAdministrativeUnitsAndUserCommune : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "commune_id",
                table: "users",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "administrative_units",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    level = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    parent_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: true),
                    last_updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    last_updated_by = table.Column<Guid>(type: "uuid", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_administrative_units", x => x.id);
                    table.ForeignKey(
                        name: "fk_administrative_units_administrative_units_parent_id",
                        column: x => x.parent_id,
                        principalTable: "administrative_units",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_users_commune_id",
                table: "users",
                column: "commune_id");

            migrationBuilder.CreateIndex(
                name: "ix_administrative_units_code",
                table: "administrative_units",
                column: "code",
                unique: true,
                filter: "is_deleted = false");

            migrationBuilder.CreateIndex(
                name: "ix_administrative_units_parent_id",
                table: "administrative_units",
                column: "parent_id");

            migrationBuilder.AddForeignKey(
                name: "fk_users_administrative_units_commune_id",
                table: "users",
                column: "commune_id",
                principalTable: "administrative_units",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_users_administrative_units_commune_id",
                table: "users");

            migrationBuilder.DropTable(
                name: "administrative_units");

            migrationBuilder.DropIndex(
                name: "ix_users_commune_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "commune_id",
                table: "users");
        }
    }
}
