using SmartQueue.Application.DTOs.Staff;

namespace SmartQueue.Application.Interfaces;

public interface IStaffService
{
    Task<List<StaffDto>> GetStaffAsync();
        Task<StaffDto> CreateStaffAsync(CreateStaffDto dto);
     Task<StaffDto> UpdateStaffAsync(
    string id,
    UpdateStaffDto dto);
}