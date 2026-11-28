using FluentValidation;

namespace LandManagement.UseCases.InventoryEntries.ImportWorkbook;

public class ImportWorkbookValidator : AbstractValidator<ImportWorkbookCommand>
{
    public ImportWorkbookValidator()
    {
        RuleFor(x => x.PeriodId).NotEmpty().WithMessage("Chọn kỳ kiểm kê");
        RuleFor(x => x.File).NotNull().WithMessage("Chọn file Excel")
            .Must(f => Path.GetExtension(f.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase)).WithMessage("Chỉ nhận file .xlsx (mở file .xls bằng Excel rồi Lưu thành .xlsx)")
            .Must(f => f.Length is > 0 and <= 10 * 1024 * 1024).WithMessage("File phải có dữ liệu và không quá 10 MB");
    }
}
