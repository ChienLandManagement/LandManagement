using FluentValidation;
using FastEndpoints;
using FastEndpoints.Swagger;
using LandManagement.Api.Common.Behaviors;
using LandManagement.Api.Common.Interfaces;
using LandManagement.Api.Configurations;
using LandManagement.Api.Data;
using LandManagement.Api.Middleware;
using LandManagement.Api.Options;
using LandManagement.Api.Security;
using LandManagement.Api.Services;
using LandManagement.Api.Services.FileStorage;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using ZiggyCreatures.Caching.Fusion;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Serilog + PostgreSQL
builder.Configuration["Serilog:WriteTo:1:Args:connectionString"] = connectionString;
builder.Host.UseSerilog((ctx, lc) => lc.ReadFrom.Configuration(ctx.Configuration));

// MediatR & FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssemblyContaining<Program>();
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(QueryCachingBehavior<,>));
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(CacheInvalidationBehavior<,>));
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(DomainExceptionBehavior<,>));
});

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        connectionString,
        b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName))
        .UseSnakeCaseNamingConvention());
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// FusionCache (in-memory)
builder.Services.AddMemoryCache();
builder.Services.AddFusionCache()
    .WithDefaultEntryOptions(new FusionCacheEntryOptions
    {
        Duration = TimeSpan.FromMinutes(10),
        JitterMaxDuration = TimeSpan.FromSeconds(2)
    });
builder.Services.AddSingleton<ICacheService, FusionCacheService>();

// Options & Services
builder.Services.Configure<MailSettings>(builder.Configuration.GetSection(MailSettings.SectionName));
builder.Services.Configure<SeaweedS3Options>(builder.Configuration.GetSection(SeaweedS3Options.SectionName));
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IGoogleAuthService, GoogleAuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddSingleton<IFileStorageService, S3FileStorageService>();

builder.Services
    .AddFastEndpointsConfig()
    .AddAuthorization();

var app = builder.Build();

app.UseMiddleware<GlobalExceptionHandler>();

if (app.Environment.IsDevelopment())
{
    app.UseSwaggerGen();
    try
    {
        await app.MigrateDatabaseAsync();
    }
    catch (Exception ex)
    {
        var logger = app.Services.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "Database migration failed. App will continue without database.");
    }
}

app.UseAuthorization();
app.UseFastEndpointsConfig();

app.Run();
