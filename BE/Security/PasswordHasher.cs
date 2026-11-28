using BCrypt.Net;

using ResultLib.Extensions;
using ResultLib.Interfaces;

namespace LandManagement.Security;

public class PasswordHasher : IPasswordHasher
{
    public string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password);

    public bool Verify(string password, string hash)
    {
        // Hash rỗng hoặc sai định dạng coi là không khớp, không để BCrypt ném exception (500).
        if (hash.IsEmpty()) return false;

        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch (Exception ex) when (ex is SaltParseException or ArgumentException)
        {
            return false;
        }
    }
}
