using FluentValidation;

namespace LandManagement.UseCases.Users.ResetUserPassword;

public class ResetUserPasswordValidator : AbstractValidator<ResetUserPasswordCommand>
{
    public ResetUserPasswordValidator() => RuleFor(x => x.NewPassword).MustBeValidPassword();
}
