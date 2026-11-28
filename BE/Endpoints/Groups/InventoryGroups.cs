using FastEndpoints;

namespace LandManagement.Groups;

public sealed class InventoryPeriodsGroup : Group
{
    public InventoryPeriodsGroup() => Configure("inventory-periods", ep => ep.Description(d => d.WithTags("InventoryPeriods")));
}

public sealed class LandChangesGroup : Group
{
    public LandChangesGroup() => Configure("land-changes", ep => ep.Description(d => d.WithTags("LandChanges")));
}

public sealed class ParcelsGroup : Group
{
    public ParcelsGroup() => Configure("parcels", ep => ep.Description(d => d.WithTags("Parcels")));
}

public sealed class DossiersGroup : Group
{
    public DossiersGroup() => Configure("gcn-dossiers", ep => ep.Description(d => d.WithTags("GcnDossiers")));
}

public sealed class DashboardGroup : Group
{
    public DashboardGroup() => Configure("dashboard", ep => ep.Description(d => d.WithTags("Dashboard")));
}
