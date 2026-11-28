using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.InventoryEntries.PrefillPeriod;

// Khởi tạo số liệu kỳ này từ kỳ liền trước của cùng xã, rồi áp các biến động đã ghi (cần chọn đối tượng cho biến động mới trừ/cộng đúng ô).
public record PrefillPeriodCommand(Guid PeriodId) : ICommand<PrefillResultItem>;

public record PrefillResultItem(Guid PreviousPeriodId, int AreaCells, int CountCells, List<string> Warnings);
