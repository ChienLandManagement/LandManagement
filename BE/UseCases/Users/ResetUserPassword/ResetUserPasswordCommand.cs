using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.Users.ResetUserPassword;

public record ResetUserPasswordCommand(Guid Id, string NewPassword) : ICommand;
