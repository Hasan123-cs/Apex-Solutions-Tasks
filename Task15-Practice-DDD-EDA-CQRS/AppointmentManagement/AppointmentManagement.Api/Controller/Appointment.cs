using AppointmentManagement.Application.Appointments.Commands;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AppointmentManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly ISender _sender;

    public AppointmentsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateAppointment(
        [FromBody] CreateAppointmentCommand command,
        CancellationToken ct)
    {
        var id = await _sender.Send(command, ct);

        return Ok(new { AppointmentId = id });
    }

    [HttpPut("{id:guid}/complete")]
    public async Task<IActionResult> CompleteAppointment(
        Guid id,
        CancellationToken ct)
    {
        await _sender.Send(
            new CompleteAppointmentCommand(id), ct);

        return NoContent();
    }
}