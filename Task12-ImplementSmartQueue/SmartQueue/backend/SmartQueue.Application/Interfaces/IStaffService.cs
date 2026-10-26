using SmartQueue.Application.DTOs.Users;

namespace SmartQueue.Application.Interfaces;

public interface IStaffService
{
    Task<List<StaffDto>> GetStaffAsync();
}