using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartQueue.Application.Interfaces;
using System.Security.Claims;
using SmartQueue.Application.DTOs.Appointments;
namespace SmartQueue.Api.Controllers;

[ApiController]
[Route("api/appointments")]
[Authorize]
public class AppointmentsController : ControllerBase
{
    private readonly IAvailabilityService _availabilityService;
    private readonly IAppointmentService _appointmentService;

    public AppointmentsController(
        IAvailabilityService availabilityService, IAppointmentService appointmentService)
    {
        _availabilityService = availabilityService;
        _appointmentService = appointmentService;
    }

    [HttpGet("availability")]
    public async Task<IActionResult> GetAvailability(
        [FromQuery] int serviceId,
        [FromQuery] string staffId,
        [FromQuery] DateOnly date)
    {
        if (serviceId <= 0 ||
            string.IsNullOrWhiteSpace(staffId) ||
            date == default)
        {
            return BadRequest("Invalid availability parameters.");
        }

        var slots = await _availabilityService
            .GetAvailableSlotsAsync(serviceId, staffId, date);

        return Ok(new { slots });
    }


    [HttpPost]
    public async Task<IActionResult> CreateAppointment(
    [FromBody] CreateAppointmentDto dto)
    {
        var customerId = User.FindFirstValue("sub")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(customerId))
            return Unauthorized();

        if (dto.ServiceId <= 0 ||
            string.IsNullOrWhiteSpace(dto.StaffId) ||
            dto.Date == default)
        {
            return BadRequest("Invalid appointment data.");
        }

        try
        {
            var result = await _appointmentService
                .CreateAppointmentAsync(dto, customerId);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyAppointments()
    {
        var customerId = User.FindFirstValue("sub")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(customerId))
            return Unauthorized();

        var appointments = await _appointmentService
            .GetMyAppointmentsAsync(customerId);

        return Ok(appointments);
    }


    [HttpPatch("{id:int}/cancel")]
    public async Task<IActionResult> CancelAppointment(int id)
    {
        var customerId = User.FindFirstValue("sub")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(customerId))
            return Unauthorized();

        try
        {
            await _appointmentService.CancelAppointmentAsync(
                id, customerId);

            return Ok(new
            {
                message = "Appointment cancelled successfully."
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


    [HttpPatch("{id:int}/reschedule")]
    public async Task<IActionResult> RescheduleAppointment(
    int id,
    [FromBody] RescheduleAppointmentDto dto)
    {
        var customerId = User.FindFirstValue("sub")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(customerId))
            return Unauthorized();

        try
        {
            await _appointmentService.RescheduleAppointmentAsync(
                id, customerId, dto);

            return Ok(new
            {
                message = "Appointment rescheduled successfully."
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }
}