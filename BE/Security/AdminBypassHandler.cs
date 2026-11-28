using LandManagement.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;

namespace LandManagement.Security;

/// <summary>
/// Admin qua mọi kiểm tra vai trò (Roles(...) / [Authorize(Roles = ...)]) nên endpoint chỉ cần khai vai trò nghiệp vụ,
/// không phải nhớ thêm Admin. Chỉ nới phần vai trò: người chưa đăng nhập vẫn bị chặn ở bước xác thực.
/// </summary>
public class AdminBypassHandler : AuthorizationHandler<RolesAuthorizationRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, RolesAuthorizationRequirement requirement)
    {
        if (context.User.Identity?.IsAuthenticated == true && context.User.IsInRole(nameof(UserRole.Admin)))
            context.Succeed(requirement);
        return Task.CompletedTask;
    }
}
