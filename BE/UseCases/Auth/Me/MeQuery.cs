using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.Auth.Me;

public record MeQuery(Guid UserId) : IQuery<UserProfile>;
