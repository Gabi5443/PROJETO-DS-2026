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
    public int PasswordUsers { get; set; } = string.Empty;
    public string RoleUsers { get; set; } ;
}