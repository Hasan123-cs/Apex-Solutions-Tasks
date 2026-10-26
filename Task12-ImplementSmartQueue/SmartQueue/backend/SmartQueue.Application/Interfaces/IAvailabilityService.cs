using SmartQueue.Application.DTOs.Appointments;

namespace SmartQueue.Application.Interfaces;

public interface IAvailabilityService
{
    Task<List<AvailableSlotDto>> GetAvailableSlotsAsync(
        int serviceId,
        string staffId,
        DateOnly date,
         int? excludeAppointmentId = null);
}