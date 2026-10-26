using Microsoft.EntityFrameworkCore;
using SmartQueue.Application.DTOs.Services;
using SmartQueue.Application.Interfaces;
using SmartQueue.Infrastructure.Data;

namespace SmartQueue.Infrastructure.Services;

public class ServiceService : IServiceService
{
    private readonly ApplicationDbContext _context;

    public ServiceService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ServiceDto>> GetActiveServicesAsync()
    {
        return await _context.Services
            .AsNoTracking()
            .Where(s => s.Active)
            .OrderBy(s => s.Name)
            .Select(s => new ServiceDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                DurationMinutes = s.Duration,
                Price = s.Price,
                IsActive = s.Active
            })
            .ToListAsync();
    }
}