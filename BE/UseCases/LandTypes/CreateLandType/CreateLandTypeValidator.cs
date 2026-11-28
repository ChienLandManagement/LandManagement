using FluentValidation;

namespace LandManagement.UseCases.LandTypes.CreateLandType;

public class CreateLandTypeValidator : AbstractValidator<CreateLandTypeCommand>
{
    public CreateLandTypeValidator()
    {
        RuleFor(x => x.Code).NotEmpty().WithMessage("Nhập mã loại đất").MaximumLength(10).WithMessage("Mã loại đất tối đa 10 ký tự");
        RuleFor(x => x.Name).NotEmpty().WithMessage("Nhập tên loại đất").MaximumLength(255).WithMessage("Tên loại đất tối đa 255 ký tự");
    }
}
