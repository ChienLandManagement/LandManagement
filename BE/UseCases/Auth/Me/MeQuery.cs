using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.Auth;

public record MeQuery(Guid UserId) : IQuery<UserProfile>;
