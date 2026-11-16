namespace CinemaApi.Models;

public enum EnumTypeTicket {
    Inteira = 1,
    Meia = 2
}


public class Ticket
{
    public int IdTicket {get; set;}
    public string SeatNumberTicket {get; set;} = string.Empty;
    public EnumTypeTicket TypeTicket {get; set;} = EnumTypeTicket.Inteira;
    public decimal FinalPriceTicket {get; set;}
    public int IdOrderFk { get; set; }
    public int IdSessionFk {get; set;}
    public int IdUsersFk {get; set;}

}

public class Order
{
    public int IdOrder { get; set; }
    public decimal TotalPrice { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public int IdUsers { get; set; }
}

// 3. DTO do Carrinho: o pacote completo que o front-end envia no POST
public class CreateOrderRequest
{
    public int IdUsers { get; set; }
    public int IdSessionFk { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public List<TicketItemRequest> Items { get; set; } = new();
}

// 4. DTO de cada poltrona dentro do carrinho
public class TicketItemRequest
{
    public string SeatNumberTicket { get; set; } = string.Empty;
    public EnumTypeTicket TypeTicket { get; set; } = EnumTypeTicket.Inteira;
    public decimal FinalPriceTicket { get; set; }
}