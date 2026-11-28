using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LandManagement.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLandTypeIsMemo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_memo",
                table: "land_types",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql("UPDATE land_types SET is_memo = true WHERE code = 'RSN';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_memo",
                table: "land_types");
        }
    }
}
