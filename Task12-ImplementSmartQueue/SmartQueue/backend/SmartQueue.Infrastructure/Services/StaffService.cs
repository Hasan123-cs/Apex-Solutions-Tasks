using Microsoft.AspNetCore.Identity;
using SmartQueue.Application.DTOs.Users;
using SmartQueue.Application.Interfaces;
using SmartQueue.Infrastructure.Identity;

namespace SmartQueue.Infrastructure.Services;

public class StaffService : IStaffService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public StaffService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<List<StaffDto>> GetStaffAsync()
    {
        var users = await _userManager.GetUsersInRoleAsync("Staff");

        return users.Select(user => new StaffDto
        {
            Id = user.Id,
            FullName = user.UserName ?? user.Email ?? "Staff",
            Email = user.Email ?? ""
        }).ToList();
    }
}