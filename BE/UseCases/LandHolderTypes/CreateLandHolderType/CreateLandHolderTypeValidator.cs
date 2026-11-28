using FluentValidation;

namespace LandManagement.UseCases.LandHolderTypes.CreateLandHolderType;

public class CreateLandHolderTypeValidator : AbstractValidator<CreateLandHolderTypeCommand>
{
    public CreateLandHolderTypeValidator()
    {
        RuleFor(x => x.Code).NotEmpty().WithMessage("Nhập mã đối tượng sử dụng/quản lý đất").MaximumLength(10).WithMessage("Mã đối tượng sử dụng/quản lý đất tối đa 10 ký tự");
        RuleFor(x => x.Name).NotEmpty().WithMessage("Nhập tên đối tượng sử dụng/quản lý đất").MaximumLength(255).WithMessage("Tên đối tượng sử dụng/quản lý đất tối đa 255 ký tự");
        RuleFor(x => x.Kind).IsInEnum().WithMessage("Chọn nhóm đối tượng");
    }
}
