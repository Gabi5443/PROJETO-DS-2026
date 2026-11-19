using Microsoft.AspNetCore.Http;

namespace CinemaApi.Models;

public class UserRequest
{
    public string NameUsers { get; set; } = string.Empty;
    public string EmailUsers { get; set; } = string.Empty;
    public string PasswordUsers { get; set; } = string.Empty;
    public EnumRoleUsers RoleUsers { get; set; } = EnumRoleUsers.Client;
    public IFormFile? PhotoUsers { get; set; }
}
