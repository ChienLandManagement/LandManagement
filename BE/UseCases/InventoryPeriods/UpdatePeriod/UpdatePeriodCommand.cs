using LandManagement.Common.Interfaces;
using LandManagement.Entities;

namespace LandManagement.UseCases.InventoryPeriods.UpdatePeriod;

public record UpdatePeriodCommand(Guid Id, DateOnly CutoffDate, InventoryPeriodType Type, string? Note) : ICommand<InventoryPeriodItem>;
