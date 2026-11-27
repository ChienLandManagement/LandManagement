namespace LandManagement.Api.Common.Interfaces;

public interface ICacheKey
{
    string GetCacheKey();
}

public interface IUserSpecificCacheKey : ICacheKey;
