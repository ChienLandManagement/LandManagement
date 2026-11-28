using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.InventoryEntries.ExportPeriod;

public record ExportPeriodQuery(Guid PeriodId) : IQuery<ExportFileItem>;

public record ExportFileItem(byte[] Content, string FileName);
