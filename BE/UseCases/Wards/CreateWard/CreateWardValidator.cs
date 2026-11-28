using FluentValidation;

namespace LandManagement.UseCases.Wards.CreateWard;

public class CreateWardValidator : AbstractValidator<CreateWardCommand>
{
    public CreateWardValidator()
    {
        RuleFor(x => x.WardCode).NotEmpty().WithMessage("Nhập mã xã/phường").MaximumLength(6).WithMessage("Mã xã/phường tối đa 6 ký tự");
        RuleFor(x => x.Name).NotEmpty().WithMessage("Nhập tên xã/phường").MaximumLength(255).WithMessage("Tên xã/phường tối đa 255 ký tự");
        RuleFor(x => x.ProvinceId).NotEmpty().WithMessage("Chọn tỉnh/thành phố");
    }
}
