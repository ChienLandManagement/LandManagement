namespace LandManagement.Common.Models;

// Chỉ để mô tả OpenAPI: hình dạng thật của ResultLib.Core.Result mà endpoint trả về.
public record ApiResult<T>(bool IsError, T? Data, int StatusCode, string? ErrorMessage);
