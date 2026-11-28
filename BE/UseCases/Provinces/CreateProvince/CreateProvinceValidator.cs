using FluentValidation;

namespace LandManagement.UseCases.Provinces.CreateProvince;

public class CreateProvinceValidator : AbstractValidator<CreateProvinceCommand>
{
    public CreateProvinceValidator()
    {
        RuleFor(x => x.ProvinceCode).NotEmpty().WithMessage("Nhập mã tỉnh/thành phố").MaximumLength(2).WithMessage("Mã tỉnh/thành phố tối đa 2 ký tự");
        RuleFor(x => x.Name).NotEmpty().WithMessage("Nhập tên tỉnh/thành phố").MaximumLength(255).WithMessage("Tên tỉnh/thành phố tối đa 255 ký tự");
        RuleFor(x => x.ShortName).NotEmpty().WithMessage("Nhập tên viết tắt").MaximumLength(255).WithMessage("Tên viết tắt tối đa 255 ký tự");
        RuleFor(x => x.PlaceType).NotEmpty().WithMessage("Nhập loại đơn vị hành chính").MaximumLength(50).WithMessage("Loại đơn vị hành chính tối đa 50 ký tự");
        RuleFor(x => x.Country).MaximumLength(10).WithMessage("Mã quốc gia tối đa 10 ký tự");
    }
}
