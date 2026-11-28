using ResultLib.Core;
using ErrorOr;
using ResultLib.Extensions;
using ZiggyCreatures.Caching.Fusion;

namespace LandManagement.Common;

public interface ICacheService
{
    Task<T?> GetOrDefaultAsync<T>(string key, CancellationToken ct = default);
    Task SetAsync<T>(string key, T value, TimeSpan? expireAfter = null, IEnumerable<string>? tags = null, CancellationToken ct = default);
    Task RemoveAsync(string key, CancellationToken ct = default);
    Task RemoveByTagAsync(string tag, CancellationToken ct = default);
    Task ClearAllAsync(CancellationToken ct = default);
    Task<ErrorOr<T?>> GetOrSetAsync<T>(string key, Func<CancellationToken, Task<T?>> factory, TimeSpan? expireAfter = null, IEnumerable<string>? tags = null, CancellationToken ct = default);
}

public class FusionCacheService(IFusionCache cache) : ICacheService
{
    public async Task<T?> GetOrDefaultAsync<T>(string key, CancellationToken ct = default) => await cache.GetOrDefaultAsync<T>(key, token: ct);

    public async Task SetAsync<T>(string key, T value, TimeSpan? expireAfter = null, IEnumerable<string>? tags = null, CancellationToken ct = default)
    {
        await (expireAfter.HasValue
            ? cache.SetAsync(key, value, expireAfter.Value, tags, ct)
            : cache.SetAsync(key, value, null, tags, ct));
    }

    public async Task RemoveAsync(string key, CancellationToken ct = default) => await cache.RemoveAsync(key, null, ct);

    public async Task RemoveByTagAsync(string tag, CancellationToken ct = default) => await cache.RemoveByTagAsync(tag, null, ct);

    public async Task ClearAllAsync(CancellationToken ct = default) => await cache.ClearAsync(false, token: ct);

    public async Task<ErrorOr<T?>> GetOrSetAsync<T>(string key, Func<CancellationToken, Task<T?>> factory, TimeSpan? expireAfter = null, IEnumerable<string>? tags = null, CancellationToken ct = default)
    {
        try
        {
            return await (expireAfter.HasValue
                ? cache.GetOrSetAsync<T?>(key, async (_, t) => await factory(t), expireAfter.Value, tags, ct)
                : cache.GetOrSetAsync<T?>(key, async (_, t) => await factory(t), options: null, tags, token: ct));
        }
        catch (CacheFactoryException ex)
        {
            return ex.ToFailureError();
        }
    }

    public async Task<ErrorOr<T?>> GetOrSetAsync<T>(string key, Func<CancellationToken, Task<ErrorOr<T?>>> factory, TimeSpan? expireAfter = null, IEnumerable<string>? tags = null, CancellationToken ct = default)
    {
        // 1. Nếu cache có sẵn -> Lấy ra dùng ngay
        var maybeValue = await cache.TryGetAsync<T?>(key, token: ct);
        if (maybeValue.HasValue) return maybeValue.Value;

        // 2. Nếu Cache Miss -> Chạy Factory
        var result = await factory(ct);
        if (result.IsError) return result.Errors; // Factory lỗi -> trả lỗi ErrorOr, KHÔNG cache lỗi

        // 3. Nếu thành công và có dữ liệu -> Nạp vào Cache
        if (result.Value is not null) await SetAsync(key, result.Value, expireAfter, tags, ct);

        return result.Value;
    }
}
