using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.InventoryEntries.ImportWorkbook;

public record ImportWorkbookCommand(Guid PeriodId, IFormFile File) : ICommand<ImportResultItem>;

/// <summary>Warnings: chỗ số trong file không khớp nhau (tổng cột, dòng cha), không chặn việc nhập.</summary>
public record ImportResultItem(int AreaCells, int CountCells, int ChangeCount, List<string> Warnings);
