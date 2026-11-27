using FastEndpoints;
using FastEndpoints.Swagger;

namespace LandManagement.Api.Configurations;

public static class FastEndpointsConfig
{
    public static IServiceCollection AddFastEndpointsConfig(this IServiceCollection services)
    {
        services.AddFastEndpoints()
                .SwaggerDocument(o =>
                {
                    o.DocumentSettings = s =>
                    {
                        s.Title = "Api";
                        s.Version = "v1";
                    };
                });

        return services;
    }

    public static IApplicationBuilder UseFastEndpointsConfig(this IApplicationBuilder app)
    {
        app.UseFastEndpoints(c =>
        {
            c.Endpoints.RoutePrefix = "api";
        });

        return app;
    }
}
