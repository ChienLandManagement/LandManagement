using FastEndpoints;

namespace LandManagement.Groups;

public sealed class ProvincesGroup : Group
{
    public ProvincesGroup() => Configure("provinces", ep => ep.Description(d => d.WithTags("Provinces")));
}

public sealed class WardsGroup : Group
{
    public WardsGroup() => Configure("wards", ep => ep.Description(d => d.WithTags("Wards")));
}
