using LandManagement.Entities;
using LandManagement.Security;
using Microsoft.EntityFrameworkCore;
using ResultLib.Extensions;

namespace LandManagement.Data;

public static class IdentitySeeder
{
    // Chỉ tạo tài khoản quản trị đầu tiên khi bảng users trống và đã cấu hình Seed:AdminPassword.
    public static async Task SeedAdminAsync(this WebApplication app)
    {
        var password = app.Configuration["Seed:AdminPassword"];
        if (password.IsEmpty()) return;

        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (await db.Users.IgnoreQueryFilters().AnyAsync()) return;

        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        db.Users.Add(new User
        {
            UserName = "admin",
            PasswordHash = hasher.Hash(password),
            FullName = "Quản trị hệ thống",
            Role = UserRole.Admin
        });
        await db.SaveChangesAsync();
    }
}
