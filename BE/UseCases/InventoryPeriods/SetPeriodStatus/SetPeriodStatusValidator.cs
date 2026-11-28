using FluentValidation;

namespace LandManagement.UseCases.InventoryPeriods.SetPeriodStatus;

public class SetPeriodStatusValidator : AbstractValidator<SetPeriodStatusCommand>
{
    public SetPeriodStatusValidator() => RuleFor(x => x.Status).IsInEnum().WithMessage("Trạng thái không hợp lệ");
}
