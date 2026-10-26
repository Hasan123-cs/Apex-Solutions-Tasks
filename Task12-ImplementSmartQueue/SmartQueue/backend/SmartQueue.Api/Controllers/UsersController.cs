using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartQueue.Application.Interfaces;

namespace SmartQueue.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IStaffService _staffService;

    public UsersController(IStaffService staffService)
    {
        _staffService = staffService;
    }

    [HttpGet("staff")]
    public async Task<IActionResult> GetStaff()
    {
        var staff = await _staffService.GetStaffAsync();

        return Ok(staff);
    }
}