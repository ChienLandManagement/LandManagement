namespace LandManagement.Security;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string SigningKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = "LandManagement";
    public string Audience { get; set; } = "LandManagement";
    public int AccessTokenMinutes { get; set; } = 5;
    public int RefreshTokenDays { get; set; } = 7;
}
