using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.Users.SetUserActive;

public record SetUserActiveCommand(Guid Id, bool IsActive) : ICommand<UserItem>;
