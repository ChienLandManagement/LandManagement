namespace LandManagement.Configurations;

public static class CorsConfiguration
{
    public static IServiceCollection AddCustomCors(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

        services.AddCors(options => options.AddDefaultPolicy(policy =>
        {
            policy.AllowAnyMethod().AllowAnyHeader();

            // Dev mở rộng; môi trường khác chỉ cho các origin khai trong Cors:AllowedOrigins (rỗng thì trình duyệt chặn).
            if (environment.IsDevelopment()) policy.SetIsOriginAllowed(_ => true).AllowCredentials();
            else if (allowedOrigins.Length > 0) policy.WithOrigins(allowedOrigins).AllowCredentials();
        }));

        return services;
    }
}
