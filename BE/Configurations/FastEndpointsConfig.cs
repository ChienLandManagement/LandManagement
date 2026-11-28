using FastEndpoints;
using System.Text.Json;
using System.Text.Json.Serialization;
using FastEndpoints.Swagger;

namespace LandManagement.Configurations;

public static class FastEndpointsConfig
{
    public static IServiceCollection AddFastEndpointsConfig(this IServiceCollection services)
    {
        services.AddFastEndpoints()
                .SwaggerDocument(o =>
                {
                    o.ShortSchemaNames = true;
                    o.SerializerSettings = s =>
                    {
                        s.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                        s.Converters.Add(new JsonStringEnumConverter());
                    };
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
            c.Serializer.Options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            // Enum vào/ra bằng tên chữ ("Admin", "User"), không dùng số.
            c.Serializer.Options.Converters.Add(new JsonStringEnumConverter());
        });

        return app;
    }
}
