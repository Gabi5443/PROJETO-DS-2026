namespace CinemaApi.Models;

public class Room {
    public int IdRoom {get; set;}
    public string NameRoom {get; set;} = string.Empty;
    public int TotalRowsRoom {get; set;}
    public int SeatsPerRowRoom {get; set;}
}