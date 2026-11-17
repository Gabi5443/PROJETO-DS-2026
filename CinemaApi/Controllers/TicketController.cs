using Microsoft.AspNetCore.Mvc;
using CinemaApi.Models;
using CinemaApi.Services;

namespace CinemaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketController : ControllerBase
{
    private readonly TicketService _ticketService;

    public TicketController(TicketService ticketService)
    {
        _ticketService = ticketService;
    }

    // 1. FINALIZAR COMPRA DO CARRINHO
    // Rota: POST api/ticket
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        try
        {
            var orderId = await _ticketService.CreateOrderAsync(request);
            return Ok(new { message = "Compra realizada com sucesso!", orderId });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Erro ao finalizar a compra.", error = ex.Message });
        }
    }

    // 2. LISTAR ASSENTOS OCUPADOS DE UMA SESSÃO
    // Rota: GET api/ticket/occupied-seats/5
    [HttpGet("occupied-seats/{sessionId}")]
    public async Task<IActionResult> GetOccupiedSeats(int sessionId)
    {
        var seats = await _ticketService.GetOccupiedSeatsBySessionAsync(sessionId);
        return Ok(seats);
    }

    // 3. LISTAR INGRESSOS COMPRADOS POR UM USUÁRIO
    // Rota: GET api/ticket/user/10
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetTicketsByUser(int userId)
    {
        var tickets = await _ticketService.GetTicketsByUserAsync(userId);
        return Ok(tickets);
    }

     [HttpDelete("cancelar/{orderId}/{userId}")]
public async Task<IActionResult> CancelOrder(int orderId, int userId)
{
    var cancelado = await _ticketService.CancelOrderAsync(orderId, userId);

    if (!cancelado)
    {
        return NotFound(new { message = "Pedido não encontrado ou não pertence a este usuário." });
    }

    return Ok(new { message = "Pedido cancelado com sucesso!" });
}
}
