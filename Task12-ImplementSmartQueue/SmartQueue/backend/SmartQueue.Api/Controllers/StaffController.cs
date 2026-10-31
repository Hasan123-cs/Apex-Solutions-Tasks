using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartQueue.Application.Interfaces;
using SmartQueue.Application.DTOs.Staff;
namespace SmartQueue.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class StaffController : ControllerBase
{
    private readonly IStaffService _staffService;

    public StaffController(IStaffService staffService)
    {
        _staffService = staffService;
    }

    [HttpGet("staff")]
    public async Task<IActionResult> GetStaff()
    {
        var staff = await _staffService.GetStaffAsync();

        return Ok(staff);
    }
    
[HttpPost("staff")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> CreateStaff(
    [FromBody] CreateStaffDto dto
)
{
    try
    {
        var staff = await _staffService.CreateStaffAsync(dto);

        return StatusCode(201, staff);
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



[HttpPut("staff/{id}")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> UpdateStaff(
    string id,
    [FromBody] UpdateStaffDto dto)
{
    try
    {
        var updated = await _staffService.UpdateStaffAsync(id, dto);
        return Ok(updated);
    }
    catch (ArgumentException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}
}