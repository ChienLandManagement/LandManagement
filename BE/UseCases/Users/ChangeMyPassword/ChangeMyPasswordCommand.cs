using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.Users.ChangeMyPassword;

public record ChangeMyPasswordCommand(string CurrentPassword, string NewPassword) : ICommand;
