using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.InventoryEntries.CheckPeriod;

public record CheckPeriodQuery(Guid PeriodId) : IQuery<PeriodCheckItem>;

/// <summary>Kind: PreviousPeriod (lệch so với kỳ trước cộng biến động) hoặc AreaVsCount (có diện tích mà thiếu số lượng, hoặc ngược lại).</summary>
public record CheckIssueItem(string Kind, string Message, string? LandTypeCode, decimal? Expected, decimal? Actual);

public record PeriodCheckItem(Guid PeriodId, Guid? PreviousPeriodId, bool HasAreas, bool HasCounts, List<CheckIssueItem> Issues);
