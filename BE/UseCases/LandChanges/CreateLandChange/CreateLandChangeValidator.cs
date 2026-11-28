using FluentValidation;

namespace LandManagement.UseCases.LandChanges.CreateLandChange;

public class CreateLandChangeValidator : AbstractValidator<CreateLandChangeCommand>
{
    public CreateLandChangeValidator()
    {
        RuleFor(x => x.PeriodId).NotEmpty().WithMessage("Chọn kỳ kiểm kê");
        RuleFor(x => x.ChangeDate).NotEmpty().WithMessage("Chọn ngày biến động");
        RuleFor(x => x.Area).GreaterThan(0).WithMessage("Diện tích phải lớn hơn 0").LessThan(10_000_000m).WithMessage("Diện tích quá lớn");
        RuleFor(x => x).Must(x => x.FromLandTypeId != null || x.ToLandTypeId != null).WithMessage("Chọn loại đất cũ hoặc loại đất mới")
            .Must(x => x.FromLandTypeId != x.ToLandTypeId).WithMessage("Loại đất cũ và mới phải khác nhau");
        RuleFor(x => x.Note).MaximumLength(500).WithMessage("Ghi chú tối đa 500 ký tự");
    }
}
