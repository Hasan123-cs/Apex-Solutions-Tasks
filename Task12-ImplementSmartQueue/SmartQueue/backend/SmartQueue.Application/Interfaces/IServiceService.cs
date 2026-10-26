using SmartQueue.Application.DTOs.Services;

namespace SmartQueue.Application.Interfaces;

public interface IServiceService
{
    Task<List<ServiceDto>> GetActiveServicesAsync();
}