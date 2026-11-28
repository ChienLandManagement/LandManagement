using LandManagement.Common.Interfaces;
using LandManagement.Entities;

namespace LandManagement.UseCases.InventoryPeriods.CreatePeriod;

// WardId chỉ Admin cần điền; cán bộ xã luôn tạo cho xã của mình.
public record CreatePeriodCommand(Guid? WardId, DateOnly CutoffDate, InventoryPeriodType Type, string? Note) : ICommand<InventoryPeriodItem>;
