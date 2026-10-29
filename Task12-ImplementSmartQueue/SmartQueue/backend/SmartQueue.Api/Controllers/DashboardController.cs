
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartQueue.Infrastructure.Services.Dashboard;

namespace SmartQueue.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = "Admin,Receptionist")]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboardService;

    public DashboardController(DashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var today = TimeZoneInfo
            .ConvertTimeBySystemTimeZoneId(
                DateTime.UtcNow,
                "Asia/Beirut")
            .Date;

        var start = startDate ?? today.AddDays(-6);
        var end = endDate ?? today;

        if (start.Date > end.Date)
        {
            return BadRequest("Invalid date range.");
        }

        var result = await _dashboardService.GetStatsAsync(
            start,
            end
        );

        return Ok(result);
    }



    
[HttpGet("chart")]
public async Task<IActionResult> GetChart(
    [FromQuery] DateTime? startDate,
    [FromQuery] DateTime? endDate)
{
    var today = TimeZoneInfo
        .ConvertTimeBySystemTimeZoneId(
            DateTime.UtcNow,
            "Asia/Beirut")
        .Date;

    var start = startDate ?? today.AddDays(-6);
    var end = endDate ?? today;

    if (start.Date > end.Date)
    {
        return BadRequest("Invalid date range.");
    }

    var result = await _dashboardService.GetChartAsync(
        start,
        end
    );

    return Ok(result);
}


[HttpGet("upcoming")]
public async Task<IActionResult> GetUpcomingAppointments()
{
    var result = await _dashboardService
        .GetUpcomingAppointmentsAsync();

    return Ok(result);
}


}
