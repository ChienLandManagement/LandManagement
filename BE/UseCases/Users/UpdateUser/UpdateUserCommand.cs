using LandManagement.Common.Interfaces;
using LandManagement.Entities;

namespace LandManagement.UseCases.Users.UpdateUser;

public record UpdateUserCommand(Guid Id, string FullName, string? Email, UserRole Role) : ICommand<UserItem>;
