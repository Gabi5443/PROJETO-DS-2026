using CinemaApi.Models;
using CinemaApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5252);
});

// 1. Ativa o suporte às Controllers, não estava ativado antes
builder.Services.AddControllers();

// 2. Libera o acesso para o Front-end (CORS)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 3. Registra todos os seus serviços (Injeção de Dependência)
builder.Services.AddScoped<UsersService>();
builder.Services.AddScoped<MovieService>();
builder.Services.AddScoped<SessionService>();
builder.Services.AddScoped<RoomService>();
builder.Services.AddScoped<TicketService>();

var app = builder.Build();

app.UseStaticFiles();

// Aplica a política de CORS
app.UseCors("AllowAll");

// 4. Mapeia as rotas das Controllers (ex: /api/movie, /api/users, etc.)
app.MapControllers();

app.MapGet("/", () => "CinemaApi rodando perfeitamente!");

// Cria usuários iniciais automaticamente ao ligar a API, caso ainda não existam
using (var scope = app.Services.CreateScope())
{
    var userService = scope.ServiceProvider.GetRequiredService<UsersService>();
    var usuariosExistentes = await userService.GetAllAsync();

    if (!usuariosExistentes.Any(u => u.EmailUsers == "fulana@gmail.com"))
    {
        await userService.CreateAsync(new Users
        {
            NameUsers = "Fulana",
            EmailUsers = "fulana@gmail.com",
            PasswordUsers = "123",
            RoleUsers = EnumRoleUsers.Client
        });
    }

    if (!usuariosExistentes.Any(u => u.EmailUsers == "admin@movieing.com"))
    {
        await userService.CreateAsync(new Users
        {
            NameUsers = "Admin",
            EmailUsers = "admin@movieing.com",
            PasswordUsers = "123",
            RoleUsers = EnumRoleUsers.Worker
        });
    }
}


app.Run();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();

