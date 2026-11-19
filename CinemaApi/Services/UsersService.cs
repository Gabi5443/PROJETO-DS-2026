using MySqlConnector;
// Importa a pasta Models para que este arquivo reconheça a classe "Users"
using CinemaApi.Models;

// Define o "endereço" (organização) desta classe dentro do projeto
namespace CinemaApi.Services;

// Declara a classe de serviço responsável pelas regras e comandos SQL de Usuários
public class UsersService
{
    // Variável privada (só vista aqui dentro) para guardar o endereço/senha do banco de dados
    private readonly string _connectionString;

    // Construtor da classe: roda automaticamente quando o UsersService é chamado
    // O C# injeta o "IConfiguration" para conseguirmos ler o arquivo appsettings.json
    public UsersService(IConfiguration configuration)
    {
        // Pega a string chamada "DefaultConnection" lá do appsettings.json e salva na variável
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

public async Task CreateAsync(Users user)
    {
        // Prepara a conexão com o MySQL usando o endereço salvo. 
        // O "using" garante que a conexão será fechada e limpa da memória assim que o método acabar
        using var connection = new MySqlConnection(_connectionString);
        
        // Abre efetivamente a "porta" de comunicação com o banco de dados
        await connection.OpenAsync();

        // Escreve o comando SQL que será enviado. O "@" antes do texto permite quebrar linhas na string
        // Os nomes com @ (@name, @email...) são espaços reservados (parâmetros) para os valores reais
        var query = @"INSERT INTO USERS (NAME_USERS, EMAIL_USERS, PASSWORD_USERS, PHOTO_USERS, ROLE_USERS) 
                      VALUES (@name, @email, @password, @photo, @role)";

        // Cria o "mensageiro" (command) que vai levar o texto SQL através da conexão aberta
        using var command = new MySqlCommand(query, connection);
        
        // Substitui cada @ na query pelos valores reais que vieram no objeto "user"
        // Fazer isso evita ataques de SQL Injection
        
        command.Parameters.AddWithValue("@name", user.NameUsers);
        command.Parameters.AddWithValue("@email", user.EmailUsers);
        string senhaHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordUsers);
        command.Parameters.AddWithValue("@password", senhaHash);
        command.Parameters.AddWithValue("@photo", user.PhotoUsers);
        command.Parameters.AddWithValue("@role", user.RoleUsers.ToString());

        // Executa o comando no banco. "ExecuteNonQueryAsync" é usado quando NÃO esperamos dados de volta (INSERT, UPDATE, DELETE)
        await command.ExecuteNonQueryAsync();
    }

    // =========================================================================
    // 2. LOGIN / BUSCAR POR E-MAIL E SENHA (READ)
    // =========================================================================
    // O "?" em "Users?" indica que este método pode devolver um Usuário OU "null" (caso erre a senha)
    public async Task<Users?> LoginAsync(string email, string password)
    {
        // Prepara a conexão com o banco
        using var connection = new MySqlConnection(_connectionString);
        // Abre a conexão
        await connection.OpenAsync();

        // Comando SQL para buscar os dados do usuário onde o e-mail E a senha batem com o que foi digitado
        var query = @"SELECT ID_USERS, NAME_USERS, EMAIL_USERS, PASSWORD_USERS, PHOTO_USERS, ROLE_USERS 
                      FROM USERS 
                      WHERE EMAIL_USERS = @email";

        // Prepara o comando SQL na conexão
        using var command = new MySqlCommand(query, connection);
        // Preenche os parâmetros com o e-mail e senha recebidos no método
        command.Parameters.AddWithValue("@email", email);

        // Executa a busca e guarda o resultado dentro de um "leitor" (reader)
        // "ExecuteReaderAsync" é usado para comandos SELECT (quando esperamos linhas de volta)
        using var reader = await command.ExecuteReaderAsync();

        // "reader.ReadAsync()" tenta pular para a primeira linha encontrada no banco.
        // Se existir uma linha (ou seja, e-mail e senha estavam certos), ele entra no "if"
        if (await reader.ReadAsync())
        {
            string hashSalvo = reader.GetString("PASSWORD_USERS");
            if (!BCrypt.Net.BCrypt.Verify(password, hashSalvo)) return null;
            // Cria um novo objeto Users em C# e preenche lendo coluna por coluna do banco
            return new Users
            {
                // Pega o número inteiro da coluna ID_USERS
                IdUsers = reader.GetInt32("ID_USERS"),
                // Pega o texto da coluna NAME_USERS
                NameUsers = reader.GetString("NAME_USERS"),
                // Pega o texto da coluna EMAIL_USERS
                EmailUsers = reader.GetString("EMAIL_USERS"),
                PhotoUsers = reader.GetString("PHOTO_USERS"),
                // Pega o texto da coluna ROLE_USERS
               // Linha 90 e Linha 128:
              RoleUsers = Enum.Parse<EnumRoleUsers>(reader.GetString("ROLE_USERS"), ignoreCase: true)
              // A linguagem de csharp é super tipada e forte, ela não sabe converter mysql (que envia dados string) para enum sozinho, é preciso portanto ajuda-lo nisso.
 

            };
        }

        // Se o "if" der falso (não achou ninguém no banco), retorna vazio (null)
        return null; 
    }


public async Task<List<Users>> GetAllAsync()
    {
        // Cria uma lista vazia que vai guardar todos os filmes encontrados
        var users = new List<Users>();

        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        // Como queremos todos, não tem cláusula WHERE
        var query = @"SELECT ID_USERS, NAME_USERS, EMAIL_USERS, PHOTO_USERS, ROLE_USERS 
                      FROM USERS";

        using var command = new MySqlCommand(query, connection);
        using var reader = await command.ExecuteReaderAsync();

        // Enquanto houver linhas para ler no resultado do banco, ele repete o bloco
        while (await reader.ReadAsync())
        {
            var user = new Users
            {
                // Pega o número inteiro da coluna ID_USERS
                IdUsers = reader.GetInt32("ID_USERS"),
                // Pega o texto da coluna NAME_USERS
                NameUsers = reader.GetString("NAME_USERS"),
                // Pega o texto da coluna EMAIL_USERS
                EmailUsers = reader.GetString("EMAIL_USERS"),
                PhotoUsers = reader.GetString("PHOTO_USERS"),
                // Pega o texto da coluna ROLE_USERS
               // Linha 90 e Linha 128:
              RoleUsers = Enum.Parse<EnumRoleUsers>(reader.GetString("ROLE_USERS"), ignoreCase: true)
                
            };

            // Adiciona o filme montado dentro da lista
            users.Add(user);
        }

        // Devolve a lista completa (se não houver filmes no banco, devolve uma lista vazia [])
        return users;
    }

    // =========================================================================
    // 3. BUSCAR USUÁRIO POR ID (Para tela de Perfil)
    // =========================================================================
    // Recebe o número do ID e tenta devolver o usuário correspondente
    public async Task<Users?> GetByIdAsync(int id)
    {
        // Prepara e abre a conexão
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        // Query buscando apenas pelo ID do usuário
        var query = @"SELECT ID_USERS, NAME_USERS, EMAIL_USERS, PHOTO_USERS, ROLE_USERS 
                      FROM USERS 
                      WHERE ID_USERS = @id";

        // Cria o comando e passa o parâmetro @id
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", id);

        // Executa a leitura no banco
        using var reader = await command.ExecuteReaderAsync();

        // Se encontrou o usuário com esse ID, monta o objeto C# e devolve
        if (await reader.ReadAsync())
        {
            return new Users
            {
                IdUsers = reader.GetInt32("ID_USERS"),
                NameUsers = reader.GetString("NAME_USERS"),
                EmailUsers = reader.GetString("EMAIL_USERS"),
                PhotoUsers = reader.GetString("PHOTO_USERS"),
                // Linha 90 e Linha 128:
                RoleUsers = Enum.Parse<EnumRoleUsers>(reader.GetString("ROLE_USERS"), ignoreCase: true)


            };
        }

        // Se o ID não existir no banco, retorna null
        return null;
    }

    // =========================================================================
    // 4. ATUALIZAR DADOS DO USUÁRIO (UPDATE)
    // =========================================================================
    // Retorna um booleano (true/false) para avisar se a atualização deu certo
    public async Task<bool> UpdateAsync(int id, Users user)
    {
        // Prepara e abre a conexão
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();

        // Comando SQL para alterar nome, e-mail e senha de um usuário específico (WHERE ID_USERS = @id)
        var query = @"UPDATE USERS 
                      SET NAME_USERS = @name, EMAIL_USERS = @email, PHOTO_USERS = @photo, ROLE_USERS = @role
                      WHERE ID_USERS = @id";

        // Cria o comando e preenche todos os valores novos + o ID de quem será alterado
        using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", id);
        command.Parameters.AddWithValue("@name", user.NameUsers);
        command.Parameters.AddWithValue("@email", user.EmailUsers);
        command.Parameters.AddWithValue("@role", user.RoleUsers.ToString().ToUpper());
        command.Parameters.AddWithValue("@photo", user.PhotoUsers);

        // Executa o UPDATE e guarda quantas linhas foram modificadas no banco
        var rowsAffected = await command.ExecuteNonQueryAsync();
        
        // Se modificou 1 ou mais linhas (> 0), retorna true (sucesso). Se foi 0 (ID não existia), retorna false.
        return rowsAffected > 0; 
    }
}