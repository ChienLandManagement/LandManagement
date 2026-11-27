namespace LandManagement.Api.Common.Interfaces;

public interface ICacheService
{
    Task<T?> GetOrDefaultAsync<T>(string key, CancellationToken ct = default);
    Task SetAsync<T>(string key, T value, TimeSpan? duration = null, IEnumerable<string>? tags = null, CancellationToken ct = default);
    Task RemoveAsync(string key, CancellationToken ct = default);
    Task RemoveByTagAsync(string tag, CancellationToken ct = default);
    Task<T> GetOrSetAsync<T>(string key, Func<CancellationToken, Task<T>> factory, TimeSpan? duration = null, IEnumerable<string>? tags = null, CancellationToken ct = default);
}
