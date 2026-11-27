using LandManagement.Api.Common.Interfaces;
using ZiggyCreatures.Caching.Fusion;

namespace LandManagement.Api.Services;

public class FusionCacheService(IFusionCache cache) : ICacheService
{
    public async Task<T?> GetOrDefaultAsync<T>(string key, CancellationToken ct = default)
        => await cache.GetOrDefaultAsync<T>(key, token: ct);

    public async Task SetAsync<T>(string key, T value, TimeSpan? duration = null, IEnumerable<string>? tags = null, CancellationToken ct = default)
    {
        if (duration.HasValue)
            await cache.SetAsync(key, value, duration.Value, tags, ct);
        else
            await cache.SetAsync(key, value, null, tags, ct);
    }

    public async Task RemoveAsync(string key, CancellationToken ct = default)
        => await cache.RemoveAsync(key, null, ct);

    public async Task RemoveByTagAsync(string tag, CancellationToken ct = default)
        => await cache.RemoveByTagAsync(tag, null, ct);

    public async Task<T> GetOrSetAsync<T>(string key, Func<CancellationToken, Task<T>> factory, TimeSpan? duration = null, IEnumerable<string>? tags = null, CancellationToken ct = default)
    {
        if (duration.HasValue)
            return await cache.GetOrSetAsync<T>(key, (ctx, t) => factory(t), duration.Value, tags, ct);
        return await cache.GetOrSetAsync<T>(key, (ctx, t) => factory(t), options: null, tags, token: ct);
    }
}
