using System.Net;
using Microsoft.AspNetCore.HttpOverrides;
using IPNetwork = System.Net.IPNetwork;

namespace LandManagement.Configurations;

// Chạy sau reverse proxy (Heroku, nginx): chỉ tin X-Forwarded-* từ các mạng khai trong ForwardedHeaders:KnownNetworks
// để lấy đúng IP client cho rate limit và log đăng nhập. Mặc định là dải mạng nội bộ.
public static class ForwardedHeadersConfiguration
{
    private static readonly string[] DefaultNetworks = ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"];

    public static IServiceCollection AddCustomForwardedHeaders(this IServiceCollection services, IConfiguration configuration)
    {
        var entries = configuration.GetSection("ForwardedHeaders:KnownNetworks").Get<string[]>() is { Length: > 0 } configured ? configured : DefaultNetworks;

        services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            options.ForwardLimit = null;

            foreach (var entry in entries.Select(e => e.Trim()).Where(e => e.Length > 0))
            {
                if (IPNetwork.TryParse(entry, out var network)) options.KnownIPNetworks.Add(network);
                else if (IPAddress.TryParse(entry, out var proxy)) options.KnownProxies.Add(proxy);
            }
        });

        return services;
    }
}
