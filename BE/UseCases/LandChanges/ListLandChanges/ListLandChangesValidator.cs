using FluentValidation;
using ResultLib.Models;

namespace LandManagement.UseCases.LandChanges.ListLandChanges;

public class ListLandChangesValidator : PaginationRequestValidator<ListLandChangesQuery>
{
    public ListLandChangesValidator() => RuleFor(x => x.PeriodId).NotEmpty().WithMessage("Chọn kỳ kiểm kê");
}
