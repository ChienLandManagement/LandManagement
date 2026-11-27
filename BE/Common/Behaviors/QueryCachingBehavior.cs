using System.Reflection;
using ErrorOr;
using LandManagement.Common.Attributes;
using LandManagement.Common.Interfaces;
using MediatR;

namespace LandManagement.Common.Behaviors;

public sealed class QueryCachingBehavior<TQuery, TResponse>(ICacheService cache) : IPipelineBehavior<TQuery, TResponse> where TQuery : IQuery<TResponse>
{
    public async Task<TResponse> Handle(TQuery request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var attribute = typeof(TQuery).GetCustomAttribute<CacheAttribute>();
        if (attribute is null || request is not ICacheKey cacheKeyProvider)
            return await next(cancellationToken);

        var cacheKey = cacheKeyProvider.GetCacheKey();
        var cached = await cache.GetOrDefaultAsync<TResponse>(cacheKey, cancellationToken);
        if (cached is not null) return cached;

        var response = await next(cancellationToken);

        // Kết quả lỗi không được cache.
        if (response is not IErrorOr { IsError: true })
            await cache.SetAsync(cacheKey, response, TimeSpan.FromSeconds(attribute.Seconds), attribute.Tags, cancellationToken);

        return response;
    }
}
