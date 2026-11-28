using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.InventoryPeriods.DeletePeriod;

public record DeletePeriodCommand(Guid Id) : ICommand<ErrorOr.Success>;
