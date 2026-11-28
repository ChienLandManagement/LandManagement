using LandManagement.Common.Interfaces;
using LandManagement.Entities;

namespace LandManagement.UseCases.InventoryPeriods.SetPeriodStatus;

public record SetPeriodStatusCommand(Guid Id, InventoryPeriodStatus Status) : ICommand<InventoryPeriodItem>;
