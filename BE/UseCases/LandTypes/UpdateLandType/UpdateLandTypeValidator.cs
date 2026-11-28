using FluentValidation;

namespace LandManagement.UseCases.LandTypes.UpdateLandType;

public class UpdateLandTypeValidator : AbstractValidator<UpdateLandTypeCommand>
{
    public UpdateLandTypeValidator()
    {
        RuleFor(x => x.Code).NotEmpty().WithMessage("Nhập mã loại đất").MaximumLength(10).WithMessage("Mã loại đất tối đa 10 ký tự");
        RuleFor(x => x.Name).NotEmpty().WithMessage("Nhập tên loại đất").MaximumLength(255).WithMessage("Tên loại đất tối đa 255 ký tự");
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0).WithMessage("Thứ tự không hợp lệ");
    }
}
