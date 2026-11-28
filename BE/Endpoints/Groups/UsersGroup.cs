using FastEndpoints;

namespace LandManagement.Groups;

public sealed class UsersGroup : Group
{
    public UsersGroup()
    {
        Configure("users", ep =>
        {
            ep.Description(d => d.WithTags("Users"));
        });
    }
}
