using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.Users.DeleteUser;

public record DeleteUserCommand(Guid Id) : ICommand;
