using System.Reflection;
using LandManagement.Api.Common.Attributes;
using LandManagement.Api.Common.Interfaces;
using LandManagement.Api.Common.Interfaces;
using MediatR;

namespace LandManagement.Api.Common.Behaviors;

public sealed class CacheInvalidationBehavior<TCommand, TResponse>(ICacheService cache) : IPipelineBehavior<TCommand, TResponse> where TCommand : ICommand<TResponse>
{
    public async Task<TResponse> Handle(TCommand request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var response = await next(cancellationToken);

        var result = response as dynamic;
        if (result == null || result?.IsError) return response;

        var attributes = typeof(TCommand).GetCustomAttributes<InvalidateCacheAttribute>();
        foreach (var attr in attributes)
        {
            if (attr.Tags is not { Length: > 0 }) continue;
            foreach (var tag in attr.Tags)
                await cache.RemoveByTagAsync(tag, cancellationToken);
        }

        if (request is not ICacheInvalidation invalidation) return response;

        var keys = invalidation.GetCacheKeys();
        if (keys is { Length: > 0 })
            foreach (var key in keys)
                await cache.RemoveAsync(key, cancellationToken);

        var tags = invalidation.GetCacheTags();
        if (tags is { Length: > 0 })
            foreach (var tag in tags)
                await cache.RemoveByTagAsync(tag, cancellationToken);

        return response;
    }
}
