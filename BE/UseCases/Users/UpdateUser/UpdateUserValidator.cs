using FluentValidation;
using ResultLib.Extensions;

namespace LandManagement.UseCases.Users.UpdateUser;

public class UpdateUserValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().WithMessage("Nhập họ tên").MaximumLength(200).WithMessage("Họ tên tối đa 200 ký tự");
        RuleFor(x => x.Email).EmailAddress().WithMessage("Email không hợp lệ").MaximumLength(200).WithMessage("Email tối đa 200 ký tự").When(x => x.Email.IsNotEmpty());
        RuleFor(x => x.Role).IsInEnum().WithMessage("Vai trò không hợp lệ");
    }
}
