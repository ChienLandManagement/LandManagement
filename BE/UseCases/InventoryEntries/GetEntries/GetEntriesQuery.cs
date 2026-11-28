using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.InventoryEntries.GetEntries;

public record GetEntriesQuery(Guid PeriodId) : IQuery<PeriodEntriesItem>;
