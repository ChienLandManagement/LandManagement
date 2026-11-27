using FastEndpoints;

namespace LandManagement.Groups;

public sealed class AuthGroup : Group
{
    public AuthGroup()
    {
        Configure("auth", ep =>
        {
            ep.Description(d => d.WithTags("Auth"));
        });
    }
}
