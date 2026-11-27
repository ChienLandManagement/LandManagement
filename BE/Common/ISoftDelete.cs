namespace LandManagement.Api.Common;

public interface ISoftDelete
{
    bool IsDeleted { get; }
}
