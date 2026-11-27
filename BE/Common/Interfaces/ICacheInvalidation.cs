namespace LandManagement.Common.Interfaces;

public interface ICacheInvalidation
{
    string[]? GetCacheKeys() => null;
    string[]? GetCacheTags() => null;
}
