namespace LandManagement.Api.Options;

public class SeaweedS3Options
{
    public const string SectionName = "SeaweedS3";
    public string ServiceUrl { get; init; } = null!;
    public string BucketName { get; init; } = null!;
    public string AccessKey { get; init; } = null!;
    public string SecretKey { get; init; } = null!;
    public int UrlExpiryMinutes { get; init; } = 15;
    public int MaxFileSizeMB { get; init; } = 50;
}
