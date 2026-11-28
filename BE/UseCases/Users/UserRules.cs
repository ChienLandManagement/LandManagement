using ErrorOr;
using FluentValidation;
using ResultLib.Extensions;
using ResultLib.Logging;

namespace LandManagement.UseCases.Users;

// Phần dùng chung của các use case người dùng: lỗi, chuẩn hóa email, rule mật khẩu.
public static class UserRules
{
    public static readonly Error NotFound = Error.NotFound("Không tìm thấy tài khoản".ToMessageForUser());

    public static string? NormalizeEmail(this string? email) => email.IsEmpty() ? null : email!.Trim();

    public static IRuleBuilderOptions<T, string> MustBeValidPassword<T>(this IRuleBuilder<T, string> rule) =>
        rule.NotEmpty().WithMessage("Nhập mật khẩu")
            .MinimumLength(8).WithMessage("Mật khẩu tối thiểu 8 ký tự")
            .MaximumLength(128).WithMessage("Mật khẩu tối đa 128 ký tự");
}
