using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using CinemaApi.Models;
using CinemaApi.Services;

namespace CinemaApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class MovieController : ControllerBase
{
    private readonly MovieService _movieService;

    public MovieController(MovieService movieService)
    {
        _movieService = movieService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateMovie([FromBody] Movie movie)
    {
        try
        {
            await _movieService.CreateAsync(movie);
            return Ok(new { message = "Filme cadastrado com sucesso!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro no servidor: " + ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllMovies()
    {
        var movies = await _movieService.GetAllAsync();
        return Ok(movies);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMovieById(int id)
    {
        var movie = await _movieService.GetByIdAsync(id);
        if (movie == null)
        {
            return NotFound(new { message = "Filme não encontrado." });
        }
        return Ok(movie);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMovie(int id, [FromBody] Movie movie)
    {
        var updated = await _movieService.UpdateAsync(id, movie);
        if (!updated)
        {
            return NotFound(new { message = "Filme não encontrado para atualização." });
        }
        return Ok(new { message = "Filme atualizado com sucesso!" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMovie(int id)
    {
        var deleted = await _movieService.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = "Filme não encontrado para exclusão." });
        }
        return Ok(new { message = "Filme removido com sucesso!" });
    }
}