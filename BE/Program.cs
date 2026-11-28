using FluentValidation;
using LandManagement;
using LandManagement.Common;
using LandManagement.BackgroundServices;
using FastEndpoints;
using FastEndpoints.Security;
using FastEndpoints.Swagger;
using LandManagement.Common.Behaviors;
using LandManagement.Common.Interfaces;
using LandManagement.Configurations;
using LandManagement.Data;
using LandManagement.Data.Interceptors;
using LandManagement.Options;
using LandManagement.Security;
using LandManagement.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ResultLib.Core;
using ResultLib.Extensions;
using ResultLib.Logging;
using RazorLight;
using Serilog;
using Log = ResultLib.Logging.Log;
using ZiggyCreatures.Caching.Fusion;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Giới hạn PageSize tối đa của phân trang: ResultLib mặc định 100, đổi bằng cấu hình "Pagination:MaxPageSize".
ResultLibOptions.Pagination.MaxPageSize = builder.Configuration.GetValue("Pagination:MaxPageSize", ResultLibOptions.Pagination.MaxPageSize);

// Serilog + PostgreSQL
builder.Configuration["Serilog:WriteTo:1:Args:connectionString"] = connectionString;
builder.Host.UseSerilog((ctx, lc) => lc.ReadFrom.Configuration(ctx.Configuration).Enrich.With<LogIdEnricher>());

// MediatR & FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssemblyContaining<Program>();
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(QueryCachingBehavior<,>));
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(CacheInvalidationBehavior<,>));
});

// Database
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();
builder.Services.AddScoped<AuditableEntityInterceptor>();
builder.Services.AddDbContext<AppDbContext>((sp, options) =>
    options.UseNpgsql(
        connectionString,
        b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName))
        .UseSnakeCaseNamingConvention()
        .AddInterceptors(sp.GetRequiredService<AuditableEntityInterceptor>()));

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
builder.Services.Configure<MailOptions>(builder.Configuration.GetSection(MailOptions.SectionName));
builder.Services.Configure<AuthOptions>(builder.Configuration.GetSection(AuthOptions.SectionName));
// Khóa S3 lấy từ biến môi trường AWS_* (đã setx trên máy), không ghi vào file cấu hình.
builder.Configuration["SeaweedS3:AccessKey"] = Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID") ?? builder.Configuration["SeaweedS3:AccessKey"];
builder.Configuration["SeaweedS3:SecretKey"] = Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY") ?? builder.Configuration["SeaweedS3:SecretKey"];
builder.Services.Configure<SeaweedS3Options>(builder.Configuration.GetSection(SeaweedS3Options.SectionName));
builder.Services.AddScoped<ResultLib.Interfaces.IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IGoogleAuthService, GoogleAuthService>();
builder.Services.AddSingleton<IRazorLightEngine>(_ => new RazorLightEngineBuilder()
    .UseFileSystemProject(Path.Combine(AppContext.BaseDirectory, "Resources", "Templates"))
    .UseMemoryCachingProvider()
    .Build());
builder.Services.AddSingleton<IEmailService, EmailService>();
builder.Services.AddSingleton<MailQueue>();
builder.Services.AddSingleton<IMailQueue>(sp => sp.GetRequiredService<MailQueue>());
builder.Services.AddHostedService<SendMailWorker>();
builder.Services.AddHostedService<TokenCleanupWorker>();
builder.Services.AddHostedService<LoginLogCleanupWorker>();

// JWT
var jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
builder.Services.AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection(JwtOptions.SectionName))
    .Validate(o => o.SigningKey.Length >= 32, "Jwt:SigningKey phải có ít nhất 32 ký tự")
    .ValidateOnStart();
builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services
    .AddAuthenticationJwtBearer(
        s => s.SigningKey = jwt.SigningKey,
        o =>
        {
            o.MapInboundClaims = false;
            o.TokenValidationParameters.ValidateIssuer = true;
            o.TokenValidationParameters.ValidIssuer = jwt.Issuer;
            o.TokenValidationParameters.ValidateAudience = true;
            o.TokenValidationParameters.ValidAudience = jwt.Audience;
        })
    .AddAuthorization();


builder.Services
    .AddCustomForwardedHeaders(builder.Configuration)
    .AddCustomCors(builder.Configuration, builder.Environment)
    .AddCustomRateLimiting();
builder.Services.AddResultLibExceptionHandler();
builder.Services.AddProblemDetails();
builder.Services.AddFastEndpointsConfig();

var app = builder.Build();

// Cứu hộ khẩn cấp admin: --reset-admin, --list-admins
await MaintenanceTools.RunCommandAsync(args, app.Services);

Log.Configure(app.Services.GetRequiredService<ILoggerFactory>(), new LogOptions { LogUserErrors = false });

app.UseForwardedHeaders();
app.UseResultLibExceptionHandler();

if (app.Environment.IsDevelopment()) app.UseSwaggerGen();

try
{
    await app.MigrateDatabaseAsync();
    await app.SeedAdminAsync();
    await app.SeedCatalogsAsync();
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogWarning(ex, "Database migration failed. App will continue without database.");
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.UseFastEndpointsConfig();

app.Run();
