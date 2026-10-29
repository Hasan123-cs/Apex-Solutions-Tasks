
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartQueue.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;
using SmartQueue.Api.Hubs;
using System.Security.Claims;
namespace SmartQueue.Api.Controllers;
[ApiController]
[Route("api/queue")]
[Authorize(Roles = "Admin,Receptionist,Staff")]
public class QueueController : ControllerBase
{
    private readonly IQueueService _queueService;
    private readonly IHubContext<QueueHub> _hubContext;
    
    public QueueController(
    IQueueService queueService,
    IHubContext<QueueHub> hubContext)
{
    _queueService = queueService;
    _hubContext = hubContext;
}

    [HttpGet("today")]
    public async Task<IActionResult> GetTodayQueue()
    {
        var queue = await _queueService.GetTodayQueueAsync();

        return Ok(queue);
    }
   

[HttpPatch("{id:int}/call")]
public async Task<IActionResult> CallCustomer(int id)
{
    try
    {
        var currentUserId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized();

        var canManageAll =
            User.IsInRole("Admin") ||
            User.IsInRole("Receptionist");

        await _queueService.CallQueueEntryAsync(
            id,
            currentUserId,
            canManageAll);

        await _hubContext.Clients.All.SendAsync(
            "QueueUpdated");

        return Ok(new
        {
            message = "Customer called successfully."
        });
    }
    catch (KeyNotFoundException ex)
    {
        return NotFound(new { message = ex.Message });
    }
    catch (UnauthorizedAccessException ex)
    {
        return StatusCode(403, new { message = ex.Message });
    }
    catch (InvalidOperationException ex)
    {
        return Conflict(new { message = ex.Message });
    }
}


[HttpPatch("{id:int}/complete")]
public async Task<IActionResult> CompleteCustomer(int id)
{
    try
    {
         var currentUserId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized();

        var canManageAll =
            User.IsInRole("Admin") ||
            User.IsInRole("Receptionist");
        await _queueService.CompleteQueueEntryAsync(
    id,
    currentUserId,
    canManageAll);
        await _hubContext.Clients.All.SendAsync("QueueUpdated");
        return Ok(new
        {
            message = "Customer service completed successfully."
        });
    }
    catch (KeyNotFoundException ex)
    {
        return NotFound(new { message = ex.Message });
    }
    catch (InvalidOperationException ex)
    {
        return Conflict(new { message = ex.Message });
    }
}


[HttpPatch("reorder")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> ReorderQueue(
    [FromBody] List<int> orderedIds)
{
    try
    {
        await _queueService.ReorderQueueAsync(orderedIds);

        await _hubContext.Clients.All.SendAsync("QueueUpdated");

        return Ok(new
        {
            message = "Queue reordered successfully."
        });
    }
    catch (InvalidOperationException ex)
    {
        return Conflict(new { message = ex.Message });
    }
}
}
