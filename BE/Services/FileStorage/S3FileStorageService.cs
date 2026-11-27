using System.Net;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using LandManagement.Common.Models;
using LandManagement.Options;
using LandManagement.Services;
using ErrorOr;
using Microsoft.Extensions.Options;
using ResultLib.Extensions;

namespace LandManagement.Services.FileStorage;

public interface IFileStorageService
{
    Task<ErrorOr<string>> UploadFileAsync(Guid userId, Stream fileStream, string contentType, string folder, CancellationToken ct = default);
    Task<ErrorOr<Success>> DeleteFileAsync(string key, CancellationToken ct = default);
    Task<ErrorOr<FileDownloadResult>> GetFileBytesAsync(string key, CancellationToken ct = default);
    string? GetFileUrl(string? key);
}

public class S3FileStorageService : IFileStorageService
{
    private static readonly Dictionary<string, string> ContentTypeToExtension = new()
    {
        ["image/jpeg"] = ".jpg",
        ["image/png"] = ".png",
        ["image/gif"] = ".gif",
        ["image/webp"] = ".webp",
        ["application/pdf"] = ".pdf",
        ["application/msword"] = ".doc",
        ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"] = ".docx",
        ["application/vnd.ms-excel"] = ".xls",
        ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] = ".xlsx",
        ["application/zip"] = ".zip",
        ["application/x-rar-compressed"] = ".rar",
        ["application/x-7z-compressed"] = ".7z"
    };

    private readonly SeaweedS3Options _options;
    private readonly AmazonS3Client _s3;

    public S3FileStorageService(IOptions<SeaweedS3Options> options)
    {
        _options = options.Value;

        var credentials = new BasicAWSCredentials(_options.AccessKey, _options.SecretKey);
        var config = new AmazonS3Config
        {
            ServiceURL = _options.ServiceUrl,
            ForcePathStyle = true,
            UseHttp = _options.ServiceUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase),
            AuthenticationRegion = "us-east-1",
            Timeout = TimeSpan.FromSeconds(10),
            RetryMode = RequestRetryMode.Standard,
            MaxErrorRetry = 2
        };

        _s3 = new AmazonS3Client(credentials, config);
    }

    public async Task<ErrorOr<string>> UploadFileAsync(Guid userId, Stream fileStream, string contentType, string folder, CancellationToken ct = default)
    {
        var normalizedContentType = contentType.ToLowerInvariant().Trim();
        if (!ContentTypeToExtension.TryGetValue(normalizedContentType, out var extension))
            return Error.Validation("File type not supported.");

        var normalizedFolder = folder.Trim().Trim('/');
        if (normalizedFolder.IsEmpty())
            return Error.Validation("Invalid storage folder.");

        var key = $"{normalizedFolder}/{userId}/{Guid.CreateVersion7()}{extension}";

        var maxFileSizeBytes = (long)_options.MaxFileSizeMB * 1024 * 1024;
        if (fileStream.Length > maxFileSizeBytes)
            return Error.Validation($"File size exceeds {_options.MaxFileSizeMB}MB limit.");

        if (fileStream.Length == 0)
            return Error.Validation("File is empty.");

        try
        {
            var request = new PutObjectRequest
            {
                BucketName = _options.BucketName,
                Key = key,
                InputStream = fileStream,
                ContentType = normalizedContentType,
                AutoCloseStream = false
            };

            await _s3.PutObjectAsync(request, ct);
            return key;
        }
        catch (AmazonS3Exception ex)
        {
            return Error.Failure(ex.Message);
        }
    }

    public async Task<ErrorOr<Success>> DeleteFileAsync(string key, CancellationToken ct = default)
    {
        try
        {
            await _s3.DeleteObjectAsync(new DeleteObjectRequest
            {
                BucketName = _options.BucketName,
                Key = key
            }, ct);
            return Result.Success;
        }
        catch (AmazonS3Exception ex)
        {
            return Error.Failure(ex.Message);
        }
    }

    public async Task<ErrorOr<FileDownloadResult>> GetFileBytesAsync(string key, CancellationToken ct = default)
    {
        if (key.IsEmpty())
            return Error.Validation("Invalid file key.");

        try
        {
            var response = await _s3.GetObjectAsync(new GetObjectRequest
            {
                BucketName = _options.BucketName,
                Key = key.Trim()
            }, ct);

            return new FileDownloadResult(response.ResponseStream, response.Headers.ContentType, response.Headers.ContentLength, Path.GetFileName(response.Key), response.Metadata.Keys.ToDictionary(k => k, k => response.Metadata[k]));
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return Error.NotFound("File not found.");
        }
        catch (AmazonS3Exception ex)
        {
            return Error.Failure(ex.Message);
        }
    }

    public string? GetFileUrl(string? key)
    {
        return key.IsEmpty() ? null : $"{_options.ServiceUrl}/{_options.BucketName}/{key}";
    }
}