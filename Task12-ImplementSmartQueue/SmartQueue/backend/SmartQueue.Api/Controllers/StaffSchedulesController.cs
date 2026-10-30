
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartQueue.Application.DTOs.Staff;
using SmartQueue.Application.Interfaces;

namespace SmartQueue.Api.Controllers;

[ApiController]
[Route("api/staff")]
[Authorize(Roles = "Admin")]
public class StaffSchedulesController : ControllerBase
{
    private readonly IStaffScheduleService _scheduleService;

    public StaffSchedulesController(
        IStaffScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    [HttpGet("{id}/schedule")]
    public async Task<IActionResult> GetSchedule(string id)
    {
        var schedule = await _scheduleService
            .GetScheduleAsync(id);

        if (schedule == null)
        {
            return NotFound(new
            {
                message = "Staff member not found."
            });
        }

        return Ok(schedule);
    }

    [HttpPut("{id}/schedule")]
    public async Task<IActionResult> UpdateSchedule(
        string id,
        [FromBody] UpdateStaffScheduleDto dto)
    {
        try
        {
            var schedule = await _scheduleService
                .UpdateScheduleAsync(id, dto);

            if (schedule == null)
            {
                return NotFound(new
                {
                    message = "Staff member not found."
                });
            }

            return Ok(schedule);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }
}
