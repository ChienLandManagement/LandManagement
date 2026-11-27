namespace LandManagement.Api.Common.Models;

public record FileDownloadResult(Stream FileStream, string ContentType, long ContentLength, string? FileName, IDictionary<string, string>? Metadata);
