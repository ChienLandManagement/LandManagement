using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.InventoryEntries.SaveEntries;

// Value = null hoặc 0: xóa ô. Chỉ gửi các ô thay đổi.
public record AreaCellInput(Guid LandTypeId, Guid HolderTypeId, decimal? Value);

public record CountCellInput(Guid LandTypeId, Guid HolderTypeId, int? Value);

public record SaveEntriesCommand(Guid PeriodId, List<AreaCellInput>? Areas, List<CountCellInput>? Counts) : ICommand<PeriodEntriesItem>;
