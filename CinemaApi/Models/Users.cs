namespace CinemaApi.Models;

public enum EnumRoleUsers
{
    Client = 1,
    Worker = 2
}

public class Users
{
    public int IdUsers { get; set; }
    public string NameUsers { get; set; } = string.Empty;
    public string EmailUsers { get; set; } = string.Empty;
    public string PasswordUsers { get; set; } = string.Empty;
    public string PhotoUsers { get; set; } = string.Empty;
    public EnumRoleUsers RoleUsers { get; set; } = EnumRoleUsers.Client;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}