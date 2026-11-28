using FluentValidation;
using ResultLib.Extensions;

namespace LandManagement.UseCases.Users.CreateUser;

public class CreateUserValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserValidator()
    {
        RuleFor(x => x.UserName).NotEmpty().WithMessage("Nhập tên đăng nhập")
            .Matches("^[a-zA-Z0-9._-]{3,100}$").WithMessage("Tên đăng nhập 3-100 ký tự, chỉ gồm chữ không dấu, số, dấu chấm, gạch dưới, gạch ngang");
        RuleFor(x => x.Password).MustBeValidPassword();
        RuleFor(x => x.FullName).NotEmpty().WithMessage("Nhập họ tên").MaximumLength(200).WithMessage("Họ tên tối đa 200 ký tự");
        RuleFor(x => x.Email).EmailAddress().WithMessage("Email không hợp lệ").MaximumLength(200).WithMessage("Email tối đa 200 ký tự").When(x => x.Email.IsNotEmpty());
        RuleFor(x => x.Role).IsInEnum().WithMessage("Vai trò không hợp lệ");
    }
}
