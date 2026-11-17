using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using CinemaApi.Models;
using CinemaApi.Services;

namespace CinemaApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly UsersService _usersService;

    // Recebe o UsersService pronto
    public UsersController(UsersService usersService)
    {
        _usersService = usersService;
    }

    // ROTA DE CADASTRO: POST api/users
    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] Users user)
    {
        try
        {
            await _usersService.CreateAsync(user);
            return Ok(new { message = "Usuário cadastrado com sucesso!" });
        }
        catch (MySqlException ex) when (ex.Number == 1062) // Erro 1062 = E-mail duplicado no MySQL
        {
            return BadRequest(new { message = "Este e-mail já está cadastrado." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro no servidor: " + ex.Message });
        }
    }

     // ROTA DE LOGIN: POST api/users/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest loginData)
    {
        var user = await _usersService.LoginAsync(loginData.Email, loginData.Password);
        if (user == null)
        {
            return Unauthorized(new { message = "E-mail ou senha inválidos." });
        }
        return Ok(user);
    }



    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _usersService.GetAllAsync();
        return Ok(users);
    }

    // ROTA DE BUSCA POR ID: GET api/users/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await _usersService.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "Usuário não encontrado." });
        }
        return Ok(user);
    }

    // ROTA DE ATUALIZAÇÃO: PUT api/users/1
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] Users user)
    {
        var updated = await _usersService.UpdateAsync(id, user);
        if (!updated)
        {
            return NotFound(new { message = "Usuário não encontrado para atualização." });
        }
        return Ok(new { message = "Dados atualizados com sucesso!" });
    }
}