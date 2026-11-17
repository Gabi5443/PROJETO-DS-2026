using MySqlConnector;
using CinemaApi.Models;

namespace CinemaApi.Services;

public class TicketService
{
    private readonly string _connectionString;

    public TicketService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    // 1. FINALIZAR COMPRA DO CARRINHO (POST)
    public async Task<int> CreateOrderAsync(CreateOrderRequest request)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        using var transaction = await connection.BeginTransactionAsync();

        try
        {
            var totalPrice = request.Items.Sum(item => item.FinalPriceTicket);

            var orderQuery = @"INSERT INTO ORDERS (TOTAL_PRICE_ORDER, PAYMENT_METHOD_ORDER, ORDER_DATE_ORDER, ID_USERS_FK) 
                               VALUES (@totalPrice, @paymentMethod, NOW(), @idUsers);
                               SELECT LAST_INSERT_ID();";

            using var orderCmd = new MySqlCommand(orderQuery, connection, transaction);
            orderCmd.Parameters.AddWithValue("@totalPrice", totalPrice);
            orderCmd.Parameters.AddWithValue("@paymentMethod", request.PaymentMethod);
            orderCmd.Parameters.AddWithValue("@idUsers", request.IdUsers);

            var orderId = Convert.ToInt32(await orderCmd.ExecuteScalarAsync());

            var ticketQuery = @"INSERT INTO TICKET (SEAT_NUMBER_TICKET, TYPE_TICKET, FINAL_PRICE_TICKET, ID_ORDER_FK, ID_SESSION_FK) 
                                VALUES (@seatNumber, @typeTicket, @finalPrice, @idOrderFk, @idSessionFk)";

            foreach (var item in request.Items)
            {
                using var ticketCmd = new MySqlCommand(ticketQuery, connection, transaction);
                ticketCmd.Parameters.AddWithValue("@seatNumber", item.SeatNumberTicket);
                ticketCmd.Parameters.AddWithValue("@typeTicket", item.TypeTicket.ToString().ToUpper());
                ticketCmd.Parameters.AddWithValue("@finalPrice", item.FinalPriceTicket);
                ticketCmd.Parameters.AddWithValue("@idOrderFk", orderId);
                ticketCmd.Parameters.AddWithValue("@idSessionFk", request.IdSessionFk);

                await ticketCmd.ExecuteNonQueryAsync();
            }

            await transaction.CommitAsync();
            return orderId;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    // 2. LISTAR ASSENTOS OCUPADOS DE UMA SESSÃO (GET)
    public async Task<List<string>> GetOccupiedSeatsBySessionAsync(int sessionId)
    {
        var occupiedSeats = new List<string>();

        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = @"SELECT SEAT_NUMBER_TICKET 
                      FROM TICKET 
                      WHERE ID_SESSION_FK = @idSessionFk";

        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@idSessionFk", sessionId);

        using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            occupiedSeats.Add(reader.GetString("SEAT_NUMBER_TICKET"));
        }

        return occupiedSeats;
    }

    // 3. LISTAR INGRESSOS COMPRADOS POR UM USUÁRIO (GET)
    public async Task<List<Ticket>> GetTicketsByUserAsync(int userId)
    {
        var tickets = new List<Ticket>();

        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = @"SELECT t.ID_TICKET, t.SEAT_NUMBER_TICKET, t.TYPE_TICKET, 
                             t.FINAL_PRICE_TICKET, t.ID_ORDER_FK, t.ID_SESSION_FK
                      FROM TICKET t
                      INNER JOIN ORDERS o ON t.ID_ORDER_FK = o.ID_ORDER
                      WHERE o.ID_USERS_FK = @idUsers
                      ORDER BY o.ORDER_DATE_ORDER DESC";

        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@idUsers", userId);

        using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            tickets.Add(new Ticket
            {
                IdTicket = reader.GetInt32("ID_TICKET"),
                SeatNumberTicket = reader.GetString("SEAT_NUMBER_TICKET"),
                TypeTicket = Enum.Parse<EnumTypeTicket>(reader.GetString("TYPE_TICKET"), ignoreCase: true),
                FinalPriceTicket = reader.GetDecimal("FINAL_PRICE_TICKET"),
                IdOrderFk = reader.GetInt32("ID_ORDER_FK"),
                IdSessionFk = reader.GetInt32("ID_SESSION_FK")
            });
        }

        return tickets;



    }

//GET ALL TICKETS
public async Task<List<Ticket>> GetAllAsync()
    {
        // Cria uma lista vazia que vai guardar todos os filmes encontrados
        var tickets = new List<Ticket>();

        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        // Como queremos todos, não tem cláusula WHERE
        var query = @"SELECT ID_TICKET, SEAT_NUMBER_TICKET, TYPE_TICKET, FINAL_PRICE_TICKET, ID_ORDER_FK, ID_SESSION_FK
                      FROM TICKET";

        using var command = new MySqlCommand(query, connection);
        using var reader = await command.ExecuteReaderAsync();

        // Enquanto houver linhas para ler no resultado do banco, ele repete o bloco
        while (await reader.ReadAsync())
        {
            var ticket = new Ticket
            {
                 IdTicket = reader.GetInt32("ID_TICKET"),
                SeatNumberTicket = reader.GetString("SEAT_NUMBER_TICKET"),
                TypeTicket = Enum.Parse<EnumTypeTicket>(reader.GetString("TYPE_TICKET"), ignoreCase: true),
                FinalPriceTicket = reader.GetDecimal("FINAL_PRICE_TICKET"),
                IdOrderFk = reader.GetInt32("ID_ORDER_FK"),
                IdSessionFk = reader.GetInt32("ID_SESSION_FK")
            };

            // Adiciona o filme montado dentro da lista
            tickets.Add(ticket);
        }

        // Devolve a lista completa (se não houver filmes no banco, devolve uma lista vazia [])
        return tickets;
    }







    // 4. CANCELAR COMPRA DO PEDIDO (DELETE)
    public async Task<bool> CancelOrderAsync(int orderId, int userId)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = @"DELETE FROM ORDERS 
                      WHERE ID_ORDER = @idOrder AND ID_USERS_FK = @idUsers";

        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@idOrder", orderId);
        command.Parameters.AddWithValue("@idUsers", userId);

        var rowsAffected = await command.ExecuteNonQueryAsync();

        return rowsAffected > 0;
    }
}
