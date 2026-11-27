using FastEndpoints;

namespace LandManagement.Groups;

public sealed class BaseGroup : Group
{
    public BaseGroup()
    {
        Configure("base", ep =>
        {
            ep.Description(d => d.WithTags("Base"));
        });
    }
}
