using SmartQueue.Application.DTOs.Staff;

namespace SmartQueue.Application.Interfaces;

public interface IStaffScheduleService
{
    Task<StaffScheduleDto?> GetScheduleAsync(string staffId);

    Task<StaffScheduleDto?> UpdateScheduleAsync(
        string staffId,
        UpdateStaffScheduleDto dto
    );
}