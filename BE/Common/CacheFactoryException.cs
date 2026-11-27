using ErrorOr;

namespace LandManagement.Common;

/// <summary>
/// Ném từ cache factory khi fallback truy vấn DB lỗi.
/// GetOrSetAsync bắt riêng exception này để trả ErrorOr lên caller mà không cache lỗi.
/// </summary>
public class CacheFactoryException(List<Error> errors) : Exception(errors.Count > 0 ? $"{errors[0].Code} - {errors[0].Description}" : "Cache factory gặp lỗi không xác định");

/// <summary>
/// Helper cho cache factory: trả về Value khi thành công, ném CacheFactoryException khi result lỗi
/// (GetOrSetAsync sẽ bắt và chuyển thành ErrorOr mà không cache lỗi).
/// </summary>
public static class CacheFactoryResultExtensions
{
    public static T ToValueOrThrow<T>(this ErrorOr<T> result) => result.IsError ? throw new CacheFactoryException(result.Errors) : result.Value;
}
