using MySqlConnector;
using CinemaApi.Models;

namespace CinemaApi.Services;

public class MovieService
{
    private readonly string _connectionString;

    public MovieService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    public async Task CreateAsync(Movie movie)
    {
        using var connection = new MySqlConnection(_connectionString);

        await connection.OpenAsync();

        var query = @"INSERT INTO MOVIE (TITLE_MOVIE, SYNOPSIS_MOVIE, DURATION_MOVIE, GENRE_MOVIE, AGE_RATING_MOVIE, PHOTO_MOVIE) 
                      VALUES (@title, @synopsis, @duration, @genre, @ageRating, @photo)";

        using var command = new MySqlCommand(query, connection);

        command.Parameters.AddWithValue("@title", movie.TitleMovie);
        command.Parameters.AddWithValue("@synopsis", movie.SynopsisMovie);
        command.Parameters.AddWithValue("@duration", movie.DurationMovie);
        command.Parameters.AddWithValue("@genre", movie.GenreMovie);
        command.Parameters.AddWithValue("@ageRating", movie.AgeRatingMovie);
        command.Parameters.AddWithValue("@photo", movie.PhotoMovie);

        await command.ExecuteNonQueryAsync();
    }

    public async Task<List<Movie>> GetAllAsync()
    {
        // Cria uma lista vazia que vai guardar todos os filmes encontrados
        var movies = new List<Movie>();

        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        // Como queremos todos, não tem cláusula WHERE
        var query = @"SELECT ID_MOVIE, TITLE_MOVIE, SYNOPSIS_MOVIE, DURATION_MOVIE, GENRE_MOVIE, AGE_RATING_MOVIE, PHOTO_MOVIE 
                      FROM MOVIE";

        using var command = new MySqlCommand(query, connection);
        using var reader = await command.ExecuteReaderAsync();

        // Enquanto houver linhas para ler no resultado do banco, ele repete o bloco
        while (await reader.ReadAsync())
        {
            var movie = new Movie
            {
                IdMovie = reader.GetInt32("ID_MOVIE"),
                TitleMovie = reader.GetString("TITLE_MOVIE"),
                SynopsisMovie = reader.GetString("SYNOPSIS_MOVIE"),
                DurationMovie = reader.GetInt32("DURATION_MOVIE"), // Lembre de conferir se é GetString ou GetInt32
                GenreMovie = reader.GetString("GENRE_MOVIE"),
                AgeRatingMovie = reader.GetInt32("AGE_RATING_MOVIE"),
                PhotoMovie = reader.GetString("PHOTO_MOVIE")
            };

            // Adiciona o filme montado dentro da lista
            movies.Add(movie);
        }

        // Devolve a lista completa (se não houver filmes no banco, devolve uma lista vazia [])
        return movies;
    }

    public async Task<Movie?> GetByIdAsync(int id)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = @"SELECT ID_MOVIE, TITLE_MOVIE, SYNOPSIS_MOVIE, DURATION_MOVIE, GENRE_MOVIE, AGE_RATING_MOVIE, PHOTO_MOVIE
                      FROM MOVIE 
                      WHERE ID_MOVIE = @id";

        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", id);

        using var reader = await command.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            return new Movie
            {
                IdMovie = reader.GetInt32("ID_MOVIE"),
                TitleMovie = reader.GetString("TITLE_MOVIE"),
                SynopsisMovie = reader.GetString("SYNOPSIS_MOVIE"),
                DurationMovie = reader.GetInt32("DURATION_MOVIE"),
                GenreMovie = reader.GetString("GENRE_MOVIE"),
                AgeRatingMovie = reader.GetInt32("AGE_RATING_MOVIE"),
                PhotoMovie = reader.GetString("PHOTO_MOVIE")
            };
        }

        return null;
    }

    public async Task<bool> UpdateAsync(int id, Movie movie)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        var query = @"UPDATE MOVIE
                      SET TITLE_MOVIE = @title, SYNOPSIS_MOVIE = @synopsis, DURATION_MOVIE = @duration, GENRE_MOVIE = @genre, AGE_RATING_MOVIE =  @ageRating, PHOTO_MOVIE = @photo
                      WHERE ID_MOVIE = @id";

        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", id);
        command.Parameters.AddWithValue("@title", movie.TitleMovie);
        command.Parameters.AddWithValue("@synopsis", movie.SynopsisMovie);
        command.Parameters.AddWithValue("@duration", movie.DurationMovie);
        command.Parameters.AddWithValue("@genre", movie.GenreMovie);
        command.Parameters.AddWithValue("@ageRating", movie.AgeRatingMovie);
        command.Parameters.AddWithValue("@photo", movie.PhotoMovie);

        var rowsAffected = await command.ExecuteNonQueryAsync();

        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        // NUNCA esqueça o WHERE no DELETE!
        var query = "DELETE FROM MOVIE WHERE ID_MOVIE = @id";

        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", id);

        // Executa o DELETE e retorna quantas linhas foram apagadas
        var rowsAffected = await command.ExecuteNonQueryAsync();

        // Retorna true se apagou o filme, ou false se o ID não existia
        return rowsAffected > 0;
    }
}