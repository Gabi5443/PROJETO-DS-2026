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
}