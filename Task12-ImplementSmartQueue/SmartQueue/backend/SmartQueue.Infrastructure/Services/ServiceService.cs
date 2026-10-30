
using Microsoft.EntityFrameworkCore;
using SmartQueue.Application.DTOs.Services;
using SmartQueue.Application.Interfaces;
using SmartQueue.Domain.Entities;
using SmartQueue.Infrastructure.Data;

namespace SmartQueue.Infrastructure.Services;

public class ServiceService : IServiceService
{
    private readonly ApplicationDbContext _context;

    public ServiceService(ApplicationDbContext context)
    {
        _context = context;
    }

    private static ServiceDto MapToDto(Service service)
    {
        return new ServiceDto
        {
            Id = service.Id,
            Name = service.Name,
            Description = service.Description,
            DurationMinutes = service.Duration,
            Price = service.Price,
            IsActive = service.Active,
            CreatedAt = service.CreatedAt
        };
    }

    // Existing: only active services for booking
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
                IsActive = s.Active,
                CreatedAt = s.CreatedAt
            })
            .ToListAsync();
    }

    // Admin: all services, including inactive
    public async Task<List<ServiceDto>> GetAllServicesAsync()
    {
        return await _context.Services
            .AsNoTracking()
            .OrderBy(s => s.Name)
            .Select(s => new ServiceDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                DurationMinutes = s.Duration,
                Price = s.Price,
                IsActive = s.Active,
                CreatedAt = s.CreatedAt
            })
            .ToListAsync();
    }

    // Create
    public async Task<ServiceDto> CreateServiceAsync(SaveServiceDto dto)
    {
        var service = new Service
        {
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            Duration = dto.DurationMinutes,
            Price = dto.Price,
            Active = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Services.Add(service);

        await _context.SaveChangesAsync();

        return MapToDto(service);
    }

    // Edit
    public async Task<ServiceDto?> UpdateServiceAsync(
        int id,
        SaveServiceDto dto
    )
    {
        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == id);

        if (service == null)
            return null;

        service.Name = dto.Name.Trim();
        service.Description = dto.Description?.Trim();
        service.Duration = dto.DurationMinutes;
        service.Price = dto.Price;

        await _context.SaveChangesAsync();

        return MapToDto(service);
    }

    // Activate / Deactivate
    public async Task<ServiceDto?> UpdateServiceStatusAsync(
        int id,
        UpdateServiceStatusDto dto
    )
    {
        var service = await _context.Services
            .FirstOrDefaultAsync(s => s.Id == id);

        if (service == null)
            return null;

        service.Active = dto.IsActive;

        await _context.SaveChangesAsync();

        return MapToDto(service);
    }
}
