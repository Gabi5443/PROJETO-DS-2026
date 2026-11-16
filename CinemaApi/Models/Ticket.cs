namespace CinemaApi.Models;

public enum EnumTypeTicket {
    Inteira = 1,
    Meia = 2
}


public class Ticket
{
    public int IdTicket {get; set;}
    public int SeatNumberTicket {get; set;}
    public EnumTypeTicket TypeTicket {get; set;} = EnumTypeTicket.Inteira;
    public decimal FinalPriceTicket {get; set;}
    public DateTime PurchasedAtTicket {get; set;} = DateTime.UtcNow;
    public int IdSessionFk {get; set;}
    public int IdUsersFk {get; set;}

}