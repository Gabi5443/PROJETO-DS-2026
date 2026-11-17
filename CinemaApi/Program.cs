using CinemaApi.Services;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<UsersService>();
builder.Services.AddScoped<MovieService>();
builder.Services.AddScoped<SessionService>();
builder.Services.AddScoped<RoomService>();
builder.Services.AddScoped<TicketService>();

// Ensina a API a criar os serviços sempre que as controllers precisar deles
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
