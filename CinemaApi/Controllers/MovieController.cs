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
    private readonly IWebHostEnvironment _environment;

    public MovieController(MovieService movieService, IWebHostEnvironment environment)
    {
        _movieService = movieService;
         _environment = environment;
    }

   [HttpPost]
public async Task<IActionResult> CreateMovie(
    [FromForm] MovieCreateRequest request)
{
    try
    {
        string pasta = Path.Combine(
            _environment.WebRootPath,
            "uploads",
            "movies"
        );

        Directory.CreateDirectory(pasta);

        string extensao = Path.GetExtension(
            request.PhotoMovie!.FileName
        );

        string nomeArquivo = Guid.NewGuid() + extensao;

        string caminho = Path.Combine(pasta, nomeArquivo);

        using (var stream = new FileStream(caminho, FileMode.Create))
        {
            await request.PhotoMovie.CopyToAsync(stream);
        }

        var movie = new Movie
        {
            TitleMovie = request.TitleMovie,
            SynopsisMovie = request.SynopsisMovie,
            DurationMovie = request.DurationMovie,
            GenreMovie = request.GenreMovie,
            AgeRatingMovie = request.AgeRatingMovie,
            PhotoMovie = "/uploads/movies/" + nomeArquivo
        };

        await _movieService.CreateAsync(movie);

        return Ok(new
        {
            message = "Filme cadastrado com sucesso!"
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new
        {
            message = "Erro no servidor: " + ex.Message
        });
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
        try
        {
            var deleted = await _movieService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound(new { message = "Filme não encontrado para exclusão." });
            }
            return Ok(new { message = "Filme removido com sucesso!" });
        }
        catch (MySqlException ex) when (ex.Number == 1451) // Erro 1451 = Registro em uso por outra tabela (FK)
        {
            return BadRequest(new { message = "Não é possível excluir este filme pois existem sessões vinculadas a ele." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro no servidor: " + ex.Message });
        }
    }
}