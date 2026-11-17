using Microsoft.AspNetCore.Http;

namespace CinemaApi.Models;

public class MovieCreateRequest
{
    public string TitleMovie { get; set; } = string.Empty;
    public string SynopsisMovie { get; set; } = string.Empty;
    public int DurationMovie { get; set; }
    public string GenreMovie { get; set; } = string.Empty;
    public int AgeRatingMovie { get; set; }
    public IFormFile? PhotoMovie { get; set; }
}