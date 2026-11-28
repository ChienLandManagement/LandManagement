using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LandManagement.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLandChangeReason : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "reason",
                table: "land_changes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "reason_text",
                table: "land_changes",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "reason",
                table: "land_changes");

            migrationBuilder.DropColumn(
                name: "reason_text",
                table: "land_changes");
        }
    }
}
