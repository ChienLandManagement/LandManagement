using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LandManagement.Data.Migrations
{
    /// <inheritdoc />
    public partial class LoginLogGuidId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Postgres không ép bigint sang uuid; nhật ký đăng nhập bỏ được nên xoá dữ liệu rồi tạo lại cột Id.
            migrationBuilder.Sql("DELETE FROM login_logs;");
            migrationBuilder.DropPrimaryKey(name: "pk_login_logs", table: "login_logs");
            migrationBuilder.DropColumn(name: "id", table: "login_logs");
            migrationBuilder.AddColumn<Guid>(name: "id", table: "login_logs", type: "uuid", nullable: false);
            migrationBuilder.AddPrimaryKey(name: "pk_login_logs", table: "login_logs", column: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM login_logs;");
            migrationBuilder.DropPrimaryKey(name: "pk_login_logs", table: "login_logs");
            migrationBuilder.DropColumn(name: "id", table: "login_logs");
            migrationBuilder.AddColumn<long>(name: "id", table: "login_logs", type: "bigint", nullable: false)
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);
            migrationBuilder.AddPrimaryKey(name: "pk_login_logs", table: "login_logs", column: "id");
        }
    }
}
