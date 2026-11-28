using FastEndpoints;

namespace LandManagement.Groups;

public sealed class LandTypesGroup : Group
{
    public LandTypesGroup() => Configure("land-types", ep => ep.Description(d => d.WithTags("LandTypes")));
}

public sealed class LandHolderTypesGroup : Group
{
    public LandHolderTypesGroup() => Configure("land-holder-types", ep => ep.Description(d => d.WithTags("LandHolderTypes")));
}
