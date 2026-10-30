using SmartQueue.Application.DTOs.Services;

namespace SmartQueue.Application.Interfaces;

public interface IServiceService
{
    // Existing booking functionality
    Task<List<ServiceDto>> GetActiveServicesAsync();

    // Admin management
    Task<List<ServiceDto>> GetAllServicesAsync();

    Task<ServiceDto> CreateServiceAsync(SaveServiceDto dto);

    Task<ServiceDto?> UpdateServiceAsync(int id, SaveServiceDto dto);

    Task<ServiceDto?> UpdateServiceStatusAsync(
        int id,
        UpdateServiceStatusDto dto
    );
}