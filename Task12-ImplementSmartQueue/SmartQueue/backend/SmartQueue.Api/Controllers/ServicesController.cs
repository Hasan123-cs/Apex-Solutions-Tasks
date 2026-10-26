using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetServices()
    {
        var services =
            await _serviceService.GetActiveServicesAsync();

        return Ok(services);
    }
}