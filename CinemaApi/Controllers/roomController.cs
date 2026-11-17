using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using CinemaApi.Models;
using CinemaApi.Services;

namespace CinemaApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RoomController : ControllerBase
{
    private readonly RoomService _roomService;

    public RoomController(RoomService roomService)
    {
        _roomService = roomService;
    }

     [HttpGet]
    public async Task<IActionResult> GetAllRoom()
    {
        var room = await _roomService.GetAllAsync();
        return Ok(room);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoomById(int id)
    {
        var room = await _roomService.GetByIdAsync(id);
        if (room == null)
        {
            return NotFound(new { message = "Sala não encontrada." });
        }
        return Ok(room);
    }

}