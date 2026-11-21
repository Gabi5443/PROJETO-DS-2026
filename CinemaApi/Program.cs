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

app.Run();
