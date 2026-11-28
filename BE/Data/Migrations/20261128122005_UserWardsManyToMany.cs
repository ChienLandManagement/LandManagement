using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LandManagement.Data.Migrations
{
    /// <inheritdoc />
    public partial class UserWardsManyToMany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "user_wards",
                columns: table => new
                {
                    users_id = table.Column<Guid>(type: "uuid", nullable: false),
                    wards_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_wards", x => new { x.users_id, x.wards_id });
                    table.ForeignKey(
                        name: "fk_user_wards_users_users_id",
                        column: x => x.users_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_user_wards_wards_wards_id",
                        column: x => x.wards_id,
                        principalTable: "wards",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_user_wards_wards_id",
                table: "user_wards",
                column: "wards_id");

            // Giữ xã đang gán cho từng tài khoản trước khi bỏ cột cũ.
            migrationBuilder.Sql("INSERT INTO user_wards (users_id, wards_id) SELECT id, ward_id FROM users WHERE ward_id IS NOT NULL;");

            migrationBuilder.DropForeignKey(
                name: "fk_users_wards_ward_id",
                table: "users");

            migrationBuilder.DropIndex(
                name: "ix_users_ward_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "ward_id",
                table: "users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ward_id",
                table: "users",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql("UPDATE users u SET ward_id = (SELECT wards_id FROM user_wards w WHERE w.users_id = u.id LIMIT 1);");
            migrationBuilder.DropTable(
                name: "user_wards");

            migrationBuilder.CreateIndex(
                name: "ix_users_ward_id",
                table: "users",
                column: "ward_id");

            migrationBuilder.AddForeignKey(
                name: "fk_users_wards_ward_id",
                table: "users",
                column: "ward_id",
                principalTable: "wards",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
