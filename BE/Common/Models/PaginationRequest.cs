using FluentValidation;
namespace LandManagement.Api.Common.Models;
public record PaginationRequest
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? SortBy { get; init; }
    public bool IsDescending { get; init; } = false;
    public string? Query { get; init; }
    public int Skip => (Math.Max(Page, 1) - 1) * Math.Max(PageSize, 1);
    public int Take => Math.Max(PageSize, 1);
}
public class PaginationRequestValidator : AbstractValidator<PaginationRequest>
{
    public PaginationRequestValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
        RuleFor(x => x.SortBy).MaximumLength(50).When(x => !string.IsNullOrWhiteSpace(x.SortBy));
        RuleFor(x => x.Query).MaximumLength(200).When(x => !string.IsNullOrWhiteSpace(x.Query));
    }
}
