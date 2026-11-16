using MySqlConnector;
using CinemaApi.Models;

namespace CinemaApi.Services;

public class RoomService
{
    private readonly string _connectionString;

    public RoomService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    public async Task<List<Room>> GetAllAsync()
    {
        // Cria uma lista vazia que vai guardar todos os filmes encontrados
        var rooms = new List<Room>();

        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        // Como queremos todos, não tem cláusula WHERE
        var query = @"SELECT ID_ROOM, NAME_ROOM, TOTAL_ROWS_ROOM, SEATS_PER_ROW_ROOM
                      FROM ROOM";

        using var command = new MySqlCommand(query, connection);
        using var reader = await command.ExecuteReaderAsync();

        // Enquanto houver linhas para ler no resultado do banco, ele repete o bloco
        while (await reader.ReadAsync())
        {
            var room = new Room
            {
                IdRoom = reader.GetInt32("ID_ROOM"),
                NameRoom = reader.GetString("NAME_ROOM"),
                TotalRowsRoom = reader.GetInt32("TOTAL_ROWS_ROOM"),
                SeatsPerRowRoom = reader.GetInt32("SEATS_PER_ROW_ROOM") 
            };

            // Adiciona o filme montado dentro da lista
            rooms.Add(room);
        }

        // Devolve a lista completa (se não houver filmes no banco, devolve uma lista vazia [])
        return rooms;
    }

     public async Task<Room?> GetByIdAsync(int id)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = @"SELECT ID_ROOM, NAME_ROOM, TOTAL_ROWS_ROOM, SEATS_PER_ROW_ROOM
                      FROM ROOM 
                      WHERE ID_ROOM = @id";

        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", id);

        using var reader = await command.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            return new Room
            {
                IdRoom = reader.GetInt32("ID_ROOM"),
                NameRoom = reader.GetString("NAME_ROOM"),
                TotalRowsRoom = reader.GetInt32("TOTAL_ROWS_ROOM"),
                SeatsPerRowRoom = reader.GetInt32("SEATS_PER_ROW_ROOM") 
            };
        }

        return null;
    }
}