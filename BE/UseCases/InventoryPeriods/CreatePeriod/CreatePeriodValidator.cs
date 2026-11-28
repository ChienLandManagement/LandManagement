using FluentValidation;

namespace LandManagement.UseCases.InventoryPeriods.CreatePeriod;

public class CreatePeriodValidator : AbstractValidator<CreatePeriodCommand>
{
    public CreatePeriodValidator()
    {
        RuleFor(x => x.CutoffDate).NotEmpty().WithMessage("Chọn ngày chốt số liệu");
        RuleFor(x => x.Type).IsInEnum().WithMessage("Loại kỳ không hợp lệ");
        RuleFor(x => x.Note).MaximumLength(500).WithMessage("Ghi chú tối đa 500 ký tự");
    }
}
