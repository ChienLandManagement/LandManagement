using LandManagement.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace LandManagement.Api.Configurations;

public static class MigrationConfiguration
{
    public static async Task MigrateDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await context.Database.MigrateAsync();
    }
}
