using LandManagement.Data;
using LandManagement.Entities;
using LandManagement.Security;
using ResultLib.Interfaces;
using Microsoft.EntityFrameworkCore;
using ResultLib.Extensions;

namespace LandManagement;

// Cứu hộ khẩn cấp quản trị viên, chạy bằng dòng lệnh:
//   dotnet run -- --list-admins
//   dotnet run -- --reset-admin [tên đăng nhập] [mật khẩu mới]
public static class MaintenanceTools
{
    public static async Task RunCommandAsync(string[] args, IServiceProvider services)
    {
        if (args.Contains("--reset-admin"))
        {
            await ResetAdminPasswordAsync(args, services);
            Environment.Exit(0);
        }

        if (args.Contains("--list-admins"))
        {
            await ListAdminsAsync(services);
            Environment.Exit(0);
        }
    }

    private static async Task ListAdminsAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var admins = await db.Users.IgnoreQueryFilters()
            .Where(u => u.Role == UserRole.Admin)
            .OrderBy(u => u.UserName)
            .ToListAsync();

        Console.WriteLine("=== LANDMANAGEMENT - DANH SÁCH QUẢN TRỊ VIÊN ===");
        Console.WriteLine("{0,-20} | {1,-28} | {2,-30} | {3}", "UserName", "Họ và tên", "Email", "Trạng thái");
        Console.WriteLine(new string('-', 100));
        foreach (var admin in admins)
        {
            var status = admin.IsDeleted ? "Đã xóa" : admin.IsActive ? "Active" : "Bị khóa";
            Console.WriteLine("{0,-20} | {1,-28} | {2,-30} | {3}", admin.UserName, admin.FullName, admin.Email ?? "-", status);
        }
        Console.WriteLine(new string('-', 100));
    }

    private static async Task ResetAdminPasswordAsync(string[] args, IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        Console.WriteLine("=== LANDMANAGEMENT EMERGENCY MAINTENANCE: KHÔI PHỤC MẬT KHẨU ADMIN ===");

        var flagIndex = Array.IndexOf(args, "--reset-admin");
        string? userName = ArgAfter(args, flagIndex + 1);
        string? newPassword = ArgAfter(args, flagIndex + 2);

        if (userName.IsEmpty())
        {
            Console.Write("Nhập tên đăng nhập của Admin cần reset (mặc định 'admin'): ");
            var input = Console.ReadLine();
            userName = input.IsEmpty() ? "admin" : input.Trim();
        }

        var user = await db.Users.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.UserName == userName && u.Role == UserRole.Admin);
        if (user is null)
        {
            Console.WriteLine($"[LỖI] Không tìm thấy quản trị viên '{userName}'.");
            Console.WriteLine("Gợi ý: dùng 'dotnet run -- --list-admins' để xem danh sách.");
            return;
        }

        if (newPassword.IsEmpty())
        {
            Console.Write($"Nhập mật khẩu mới cho '{user.UserName}' ({user.FullName}): ");
            newPassword = Console.ReadLine();
        }

        if (newPassword is null || newPassword.Length < 6)
        {
            Console.WriteLine("[LỖI] Mật khẩu mới phải có độ dài tối thiểu 6 ký tự.");
            return;
        }

        var hash = hasher.Hash(newPassword);
        await db.Users.IgnoreQueryFilters()
            .Where(u => u.Id == user.Id)
            .ExecuteUpdateAsync(s => s
                .SetProperty(u => u.PasswordHash, hash)
                .SetProperty(u => u.IsActive, true)
                .SetProperty(u => u.IsDeleted, false));

        // Đổi mật khẩu khẩn cấp thì mọi phiên cũ phải mất hiệu lực.
        await db.RefreshTokens
            .Where(t => t.UserId == user.Id && t.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, DateTime.UtcNow));

        Console.WriteLine(new string('=', 65));
        Console.WriteLine("THIẾT LẬP MẬT KHẨU MỚI THÀNH CÔNG!");
        Console.WriteLine($"Tài khoản:  {user.UserName}");
        Console.WriteLine("Trạng thái: Active (đã mở khóa, đã thu hồi toàn bộ refresh token cũ)");
        Console.WriteLine(new string('=', 65));
    }

    private static string? ArgAfter(string[] args, int index) =>
        index < args.Length && !args[index].StartsWith("--") ? args[index] : null;
}
