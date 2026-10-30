
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartQueue.Application.DTOs.Services;
using SmartQueue.Application.Interfaces;

namespace SmartQueue.Api.Controllers;

[ApiController]
[Route("api/services")]
public class ServicesController : ControllerBase
{
    private readonly IServiceService _serviceService;

    public ServicesController(IServiceService serviceService)
    {
        _serviceService = serviceService;
    }

    // Booking: active services only
    [HttpGet]
    public async Task<IActionResult> GetServices()
    {
        var services =
            await _serviceService.GetActiveServicesAsync();

        return Ok(services);
    }

    // Admin: all services
  [HttpGet("admin")]
[Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllServices()
    {
        var services =
            await _serviceService.GetAllServicesAsync();

        return Ok(services);
    }

    // Admin: create
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateService(
        [FromBody] SaveServiceDto dto
    )
    {
        var service =
            await _serviceService.CreateServiceAsync(dto);

        return CreatedAtAction(
            nameof(GetAllServices),
            null,
            service
        );
    }

    // Admin: edit
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateService(
        int id,
        [FromBody] SaveServiceDto dto
    )
    {
        var service =
            await _serviceService.UpdateServiceAsync(id, dto);

        if (service == null)
            return NotFound(new { message = "Service not found." });

        return Ok(service);
    }

    // Admin: activate / deactivate
    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(
        int id,
        [FromBody] UpdateServiceStatusDto dto
    )
    {
        var service =
            await _serviceService.UpdateServiceStatusAsync(id, dto);

        if (service == null)
            return NotFound(new { message = "Service not found." });

        return Ok(service);
    }
}
