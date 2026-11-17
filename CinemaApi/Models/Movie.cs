namespace CinemaApi.Models;

public class Movie 
{
    public int IdMovie {get; set;}
    public string TitleMovie {get; set;} = string.Empty;
    public string SynopsisMovie{get; set;} = string.Empty;
    public int DurationMovie {get; set;}
    public string GenreMovie {get; set;} = string.Empty;
    public int AgeRatingMovie {get; set;}
    public string PhotoMovie { get; set; } = string.Empty;
}