using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using CinemaApi.Models;
using CinemaApi.Services;

namespace CinemaApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SessionController : ControllerBase
{
    private readonly SessionService _sessionService;

    public SessionController(SessionService sessionService)
    {
        _sessionService = sessionService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateSession([FromBody] Session session)
    {
        try
        {
            await _sessionService.CreateAsync(session);
            return Ok(new { message = "Sessão cadastrada com sucesso!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro no servidor: " + ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllMovies()
    {
        var sessions = await _sessionService.GetAllAsync();
        return Ok(sessions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMovieById(int id)
    {
        var session = await _sessionService.GetByIdAsync(id);
        if (session == null)
        {
            return NotFound(new { message = "Sessão não encontrado." });
        }
        return Ok(session);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSession(int id, [FromBody] Session session)
    {
        var updated = await _sessionService.UpdateAsync(id, session);
        if (!updated)
        {
            return NotFound(new { message = "Sessão não encontrada para atualização." });
        }
        return Ok(new { message = "Sessão atualizada com sucesso!" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSession(int id)
    {
        var deleted = await _sessionService.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = "Sessão não encontrada para exclusão." });
        }
        return Ok(new { message = "Sessão removida com sucesso!" });
    }
}