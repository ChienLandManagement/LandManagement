namespace LandManagement.Common.Attributes;

[AttributeUsage(AttributeTargets.Class)]
public sealed class CacheAttribute(int seconds = 60, params string[] tags) : Attribute
{
    public int Seconds { get; } = seconds;
    public string[] Tags { get; } = tags;
}

[AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
public sealed class InvalidateCacheAttribute(params string[] tags) : Attribute
{
    public string[] Tags { get; } = tags;
}
