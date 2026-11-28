namespace LandManagement.Security;

public static class WardAccess
{
    /// <summary>Xã dùng khi tạo bản ghi: Admin chọn tự do; người khác chọn trong xã được phân công, có đúng một xã thì tự lấy.</summary>
    public static Guid? Resolve(this ICurrentUser user, Guid? requested) =>
        user.IsAdmin ? requested : requested is { } id ? user.WardIds.Contains(id) ? id : null : user.WardIds.Count == 1 ? user.WardIds[0] : null;
}
