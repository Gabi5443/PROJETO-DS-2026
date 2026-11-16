namespace CinemaApi.Models;

public class Session
{
    public int IdSession { get; set; }
    public Datetime ShowTimeSession { get; set; } = DateTime.UtcNow;
    public decimal PriceSession { get; set; } 
    public int idMovieFk { get; set; } 
    public int idRoomFk { get; set; } 
}