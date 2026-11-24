
using Microsoft.AspNetCore.Mvc;

namespace CinemaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SiteController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public SiteController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpGet]
    public IActionResult Index()
    {
        var caminho = Path.Combine(
            _environment.WebRootPath,
            "CinemaSite",
            "index.html"
        );
         

    if (!System.IO.File.Exists(caminho))
    {
        return NotFound($"Arquivo não encontrado: {caminho}");
    }


        return PhysicalFile(caminho, "text/html");
    }
}
