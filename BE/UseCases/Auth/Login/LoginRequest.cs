namespace LandManagement.UseCases.Auth.Login;

// Chỉ phần client gửi; Ip và UserAgent do server điền vào LoginCommand.
public record LoginRequest(string UserName, string Password);
