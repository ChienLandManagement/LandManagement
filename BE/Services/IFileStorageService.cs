using LandManagement.Api.Common.Models;
using ErrorOr;

namespace LandManagement.Api.Services;

public interface IFileStorageService
{
    Task<ErrorOr<string>> UploadFileAsync(Guid userId, Stream fileStream, string contentType, string folder, CancellationToken ct = default);
    Task<ErrorOr<Success>> DeleteFileAsync(string key, CancellationToken ct = default);
    Task<ErrorOr<FileDownloadResult>> GetFileBytesAsync(string key, CancellationToken ct = default);
    string? GetFileUrl(string? key);
}
