using MySqlConnector;
using CinemaApi.Models;

namespace CinemaApi.Services;

public class SessionService 
{
    private readonly string _connectionString;

    public SessionService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    public async Task CreateAsync(Session session)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        
        var query = @"INSERT INTO SESSION (SHOW_TIME_SESSION, PRICE_SESSION, ID_MOVIE_FK, ID_ROOM_FK) 
                      VALUES (@showTimeSession, @price, @idMovieFk, @idRoomFk)";

        using var command = new MySqlCommand(query, connection);

        command.Parameters.AddWithValue("@showTimeSession", session.ShowTimeSession);
        command.Parameters.AddWithValue("@price", session.PriceSession);
        command.Parameters.AddWithValue("@idMovieFk", session.idMovieFk);
        command.Parameters.AddWithValue("@idRoomFk", session.idRoomFk);

        await command.ExecuteNonQueryAsync();
    }

    public async Task<List<Session>> GetAllAsync()
    {
       
        var sessions = new List<Session>();

        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = @"SELECT ID_SESSION, SHOW_TIME_SESSION, PRICE_SESSION, ID_MOVIE_FK, ID_ROOM_FK FROM SESSION";

        using var command = new MySqlCommand(query, connection);
        using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            var session = new Session
            {
                IdSession = reader.GetInt32("ID_SESSION"),
                ShowTimeSession = reader.GetDateTime("SHOW_TIME_SESSION"),
                PriceSession = reader.GetDecimal("PRICE_SESSION"),
                idMovieFk = reader.GetInt32("ID_MOVIE_FK"), 
                idRoomFk = reader.GetInt32("ID_ROOM_FK")
            };

            sessions.Add(session);
        }

       
        return sessions;
    }

      public async Task<Session?> GetByIdAsync(int id)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = @"SELECT ID_SESSION, SHOW_TIME_SESSION, PRICE_SESSION, ID_MOVIE_FK, ID_ROOM_FK FROM SESSION
                      WHERE ID_SESSION = @id";

        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", id);

        using var reader = await command.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            return new Session
            {
                IdSession = reader.GetInt32("ID_SESSION"),
                ShowTimeSession = reader.GetDateTime("SHOW_TIME_SESSION"),
                PriceSession = reader.GetDecimal("PRICE_SESSION"),
                idMovieFk = reader.GetInt32("ID_MOVIE_FK"), 
                idRoomFk = reader.GetInt32("ID_ROOM_FK")
            };
        }

        return null;
    }

    public async Task<bool> UpdateAsync(int id, Session session)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = @"UPDATE SESSION
                      SET SHOW_TIME_SESSION = @showTimeSession, PRICE_SESSION = @price, ID_MOVIE_FK= @idMovieFk, ID_ROOM_FK = @idroomFk
                      WHERE ID_SESSION = @id";

        using var command = new MySqlCommand(query, connection);
         command.Parameters.AddWithValue("@showTimeSession", session.ShowTimeSession);
        command.Parameters.AddWithValue("@price", session.PriceSession);
        command.Parameters.AddWithValue("@idMovieFk", session.idMovieFk);
        command.Parameters.AddWithValue("@idRoomFk", session.idRoomFk);

        var rowsAffected = await command.ExecuteNonQueryAsync();

        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        // NUNCA esqueça o WHERE no DELETE!
        var query = "DELETE FROM SESSION WHERE ID_SESSION = @id";

        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", id);

        // Executa o DELETE e retorna quantas linhas foram apagadas
        var rowsAffected = await command.ExecuteNonQueryAsync();

        // Retorna true se apagou o filme, ou false se o ID não existia
        return rowsAffected > 0;
    }
}
