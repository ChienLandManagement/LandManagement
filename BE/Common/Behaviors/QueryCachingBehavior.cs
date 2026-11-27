using System.Reflection;
using LandManagement.Api.Common.Attributes;
using LandManagement.Api.Common.Interfaces;
using LandManagement.Api.Common.Interfaces;
using MediatR;

namespace LandManagement.Api.Common.Behaviors;

public sealed class QueryCachingBehavior<TQuery, TResponse>(ICacheService cache) : IPipelineBehavior<TQuery, TResponse> where TQuery : IQuery<TResponse>
{
    public async Task<TResponse> Handle(TQuery request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var attribute = typeof(TQuery).GetCustomAttribute<CacheAttribute>();
        if (attribute is null || request is not ICacheKey cacheKeyProvider)
            return await next(cancellationToken);

        var cacheKey = cacheKeyProvider.GetCacheKey();

        return await cache.GetOrSetAsync(cacheKey, async ct => await next(ct), TimeSpan.FromSeconds(attribute.Seconds), attribute.Tags, cancellationToken);
    }
}
