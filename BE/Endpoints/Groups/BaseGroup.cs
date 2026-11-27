using FastEndpoints;

namespace LandManagement.Api.Groups;

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
