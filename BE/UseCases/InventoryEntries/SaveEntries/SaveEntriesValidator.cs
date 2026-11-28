using FluentValidation;

namespace LandManagement.UseCases.InventoryEntries.SaveEntries;

public class SaveEntriesValidator : AbstractValidator<SaveEntriesCommand>
{
    public SaveEntriesValidator()
    {
        RuleFor(x => x.PeriodId).NotEmpty().WithMessage("Chọn kỳ kiểm kê");
        RuleFor(x => x.Areas).Must(a => a is null || a.Count <= 5000).WithMessage("Mỗi lần lưu tối đa 5000 ô diện tích");
        RuleFor(x => x.Counts).Must(c => c is null || c.Count <= 5000).WithMessage("Mỗi lần lưu tối đa 5000 ô số lượng");
        RuleForEach(x => x.Areas).ChildRules(a => a.RuleFor(c => c.Value).InclusiveBetween(0m, 10_000_000m).When(c => c.Value != null)
            .WithMessage("Diện tích phải từ 0 đến 10.000.000 ha"));
        RuleForEach(x => x.Counts).ChildRules(a => a.RuleFor(c => c.Value).InclusiveBetween(0, 100_000_000).When(c => c.Value != null)
            .WithMessage("Số lượng phải từ 0 đến 100.000.000"));
    }
}
