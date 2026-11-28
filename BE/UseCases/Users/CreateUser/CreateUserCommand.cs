using LandManagement.Common.Interfaces;
using LandManagement.Entities;

namespace LandManagement.UseCases.Users.CreateUser;

public record CreateUserCommand(string UserName, string Password, string FullName, string? Email, UserRole Role) : ICommand<UserItem>;
