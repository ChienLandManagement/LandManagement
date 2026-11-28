using FluentValidation;

namespace LandManagement.UseCases.Users.ChangeMyPassword;

public class ChangeMyPasswordValidator : AbstractValidator<ChangeMyPasswordCommand>
{
    public ChangeMyPasswordValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty().WithMessage("Nhập mật khẩu hiện tại").MaximumLength(128).WithMessage("Mật khẩu không hợp lệ");
        RuleFor(x => x.NewPassword).MustBeValidPassword().NotEqual(x => x.CurrentPassword).WithMessage("Mật khẩu mới phải khác mật khẩu hiện tại");
    }
}
