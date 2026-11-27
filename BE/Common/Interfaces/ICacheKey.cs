namespace LandManagement.Common.Interfaces;

public interface ICacheKey
{
    string GetCacheKey();
}

public interface IUserSpecificCacheKey : ICacheKey;
