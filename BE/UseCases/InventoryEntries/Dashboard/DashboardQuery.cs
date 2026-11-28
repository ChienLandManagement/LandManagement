using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.InventoryEntries.Dashboard;

public record DashboardQuery(Guid PeriodId) : IQuery<DashboardItem>;

/// <summary>Area: diện tích loại đất (ha). Percent: so với tổng diện tích tự nhiên. Change: biến động ròng trong kỳ (đất vào trừ đất ra).</summary>
public record DashboardLandTypeItem(string Code, string Name, int Level, decimal Area, decimal Percent, decimal Change);

public record DashboardItem(
    Guid PeriodId,
    DateOnly CutoffDate,
    decimal TotalArea,
    decimal AgriculturalArea,
    decimal NonAgriculturalArea,
    decimal AgriculturalPercent,
    decimal NonAgriculturalPercent,
    DateOnly? PreviousCutoffDate,
    decimal? PreviousTotalArea,
    int ChangeCount,
    List<DashboardLandTypeItem> LandTypes);
