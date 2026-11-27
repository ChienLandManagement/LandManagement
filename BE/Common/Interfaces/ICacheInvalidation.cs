namespace LandManagement.Api.Common.Interfaces;

public interface ICacheInvalidation
{
    string[]? GetCacheKeys() => null;
    string[]? GetCacheTags() => null;
}
