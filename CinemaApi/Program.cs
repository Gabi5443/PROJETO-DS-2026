using CinemaApi.Services;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<UsersService>();
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
