using FluentValidation;

namespace LandManagement.UseCases.Auth.Login;

public class LoginValidator : AbstractValidator<LoginCommand>
{
    public LoginValidator()
    {
        RuleFor(x => x.UserName).NotEmpty().WithMessage("Nhập tên đăng nhập").MaximumLength(100).WithMessage("Tên đăng nhập không hợp lệ");
        RuleFor(x => x.Password).NotEmpty().WithMessage("Nhập mật khẩu").MaximumLength(128).WithMessage("Mật khẩu không hợp lệ");
    }
}
