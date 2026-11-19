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
    private readonly IWebHostEnvironment _environment;

    public UsersController(UsersService usersService, IWebHostEnvironment environment)
    {
        _usersService = usersService;
        _environment = environment;
    }

    // ROTA DE CADASTRO: POST api/users
    [HttpPost]
    public async Task<IActionResult> CreateUser([FromForm] UserRequest request)
    {
        try
        {
            // 1. Define a foto cinza padrão caso o usuário não envie nenhuma imagem
            string caminhoFoto = "/uploads/users/default-avatar.jpg";

            // 2. Se o usuário enviou uma foto no formulário, salva ela na pasta
            if (request.PhotoUsers != null && request.PhotoUsers.Length > 0)
            {
                string pasta = Path.Combine(_environment.WebRootPath, "uploads", "users");
                Directory.CreateDirectory(pasta);

                string extensao = Path.GetExtension(request.PhotoUsers.FileName);
                string nomeArquivo = Guid.NewGuid() + extensao;
                string caminhoCompleto = Path.Combine(pasta, nomeArquivo);

                using (var stream = new FileStream(caminhoCompleto, FileMode.Create))
                {
                    await request.PhotoUsers.CopyToAsync(stream);
                }

                caminhoFoto = "/uploads/users/" + nomeArquivo;
            }

            // 3. Monta o objeto Users para mandar ao UsersService
            var user = new Users
            {
                NameUsers = request.NameUsers,
                EmailUsers = request.EmailUsers,
                PasswordUsers = request.PasswordUsers,
                RoleUsers = request.RoleUsers,
                PhotoUsers = caminhoFoto
            };

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
    public async Task<IActionResult> UpdateUser(int id, [FromForm] UserRequest request)
    {
        try
        {
            // 1. Busca o usuário atual no banco para manter a foto antiga se nada novo for enviado
            var usuarioExistente = await _usersService.GetByIdAsync(id);
            if (usuarioExistente == null)
            {
                return NotFound(new { message = "Usuário não encontrado para atualização." });
            }

            string caminhoFotoFinal = usuarioExistente.PhotoUsers;

            // 2. Se enviou uma foto nova, salva na pasta uploads/users
            if (request.PhotoUsers != null && request.PhotoUsers.Length > 0)
            {
                string pasta = Path.Combine(_environment.WebRootPath, "uploads", "users");
                Directory.CreateDirectory(pasta);

                string extensao = Path.GetExtension(request.PhotoUsers.FileName);
                string nomeArquivo = Guid.NewGuid() + extensao;
                string caminhoCompleto = Path.Combine(pasta, nomeArquivo);

                using (var stream = new FileStream(caminhoCompleto, FileMode.Create))
                {
                    await request.PhotoUsers.CopyToAsync(stream);
                }

                // Apaga a foto antiga do servidor (desde que NÃO seja a foto cinza padrão!)
                if (!string.IsNullOrEmpty(usuarioExistente.PhotoUsers) && 
                    usuarioExistente.PhotoUsers != "/uploads/users/default-avatar.jpg")
                {
                    string caminhoAntigo = Path.Combine(_environment.WebRootPath, usuarioExistente.PhotoUsers.TrimStart('/'));
                    if (System.IO.File.Exists(caminhoAntigo))
                    {
                        System.IO.File.Delete(caminhoAntigo);
                    }
                }

                caminhoFotoFinal = "/uploads/users/" + nomeArquivo;
            }

            // 3. Monta o objeto atualizado (sem mexer na senha) e salva no banco
            var userAtualizado = new Users
            {
                NameUsers = request.NameUsers,
                EmailUsers = request.EmailUsers,
                RoleUsers = request.RoleUsers,
                PhotoUsers = caminhoFotoFinal
            };

            await _usersService.UpdateAsync(id, userAtualizado);
            return Ok(new { message = "Dados atualizados com sucesso!" });
        }
        catch (MySqlException ex) when (ex.Number == 1062)
        {
            return BadRequest(new { message = "Este e-mail já está em uso por outro usuário." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro no servidor: " + ex.Message });
        }
    }
}