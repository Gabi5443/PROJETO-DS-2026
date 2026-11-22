
using Microsoft.AspNetCore.Mvc;

namespace CinemaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public DashboardController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpGet]
    public IActionResult Index()
    {
        var caminho = Path.Combine(
            _environment.WebRootPath,
            "Dashboard",
            "index.html"
        );
         

    if (!System.IO.File.Exists(caminho))
    {
        return NotFound($"Arquivo não encontrado: {caminho}");
    }


        return PhysicalFile(caminho, "text/html");
    }
}
