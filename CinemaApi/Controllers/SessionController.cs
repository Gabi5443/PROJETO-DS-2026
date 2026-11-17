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
        catch (MySqlException ex) when (ex.Number == 1452) // Filme ou Sala inexistente
        {
            return BadRequest(new { message = "O filme ou a sala informada não existe." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro no servidor: " + ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllSessions()
    {
        var sessions = await _sessionService.GetAllAsync();
        return Ok(sessions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSessionsById(int id)
    {
        var session = await _sessionService.GetByIdAsync(id);
        if (session == null)
        {
            return NotFound(new { message = "Sessão não encontrada." });
        }
        return Ok(session);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSession(int id, [FromBody] Session session)
    {
        try
        {
            var updated = await _sessionService.UpdateAsync(id, session);
            if (!updated)
            {
                return NotFound(new { message = "Sessão não encontrada para atualização." });
            }

            return Ok(new { message = "Sessão atualizada com sucesso!" });
        }
        catch (MySqlException ex) when (ex.Number == 1452)
        {
            return BadRequest(new { message = "O filme ou a sala informada não existe." });
        }

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