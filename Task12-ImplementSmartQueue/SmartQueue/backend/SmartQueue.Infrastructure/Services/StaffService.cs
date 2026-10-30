using Microsoft.AspNetCore.Identity;
using SmartQueue.Application.DTOs.Staff;
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
    var staffUsers =
        await _userManager.GetUsersInRoleAsync("Staff");

    var receptionistUsers =
        await _userManager.GetUsersInRoleAsync("Receptionist");

    var staff = staffUsers.Select(user => new StaffDto
    {
        Id = user.Id,
        FullName = user.UserName ?? user.Email ?? "Staff",
        Email = user.Email ?? "",
        Role = "Staff"
    });

    var receptionists = receptionistUsers.Select(user => new StaffDto
    {
        Id = user.Id,
        FullName = user.UserName ?? user.Email ?? "Receptionist",
        Email = user.Email ?? "",
        Role = "Receptionist"
    });

    return staff
        .Concat(receptionists)
        .GroupBy(user => user.Id)
        .Select(group => group.First())
        .OrderBy(user => user.FullName)
        .ToList();
}

public async Task<StaffDto> CreateStaffAsync(CreateStaffDto dto)
{
    var role = dto.Role?.Trim();

    if (role != "Staff" && role != "Receptionist")
    {
        throw new ArgumentException(
            "Only Staff and Receptionist roles are allowed."
        );
    }

    var fullName = dto.FullName?.Trim();

    if (string.IsNullOrWhiteSpace(fullName))
    {
        throw new ArgumentException("Full name is required.");
    }

    var email = dto.Email?.Trim();

    if (string.IsNullOrWhiteSpace(email))
    {
        throw new ArgumentException("Email is required.");
    }

    var existingUser = await _userManager.FindByEmailAsync(email);

    if (existingUser != null)
    {
        throw new InvalidOperationException(
            "A user with this email already exists."
        );
    }

    var user = new ApplicationUser
    {
        UserName = email,
        Email = email
    };

    var result = await _userManager.CreateAsync(
        user,
        dto.Password
    );

    if (!result.Succeeded)
    {
        var errors = string.Join(
            " ",
            result.Errors.Select(e => e.Description)
        );

        throw new ArgumentException(errors);
    }

    var roleResult = await _userManager.AddToRoleAsync(user, role);

    if (!roleResult.Succeeded)
    {
        await _userManager.DeleteAsync(user);

        var errors = string.Join(
            " ",
            roleResult.Errors.Select(e => e.Description)
        );

        throw new InvalidOperationException(errors);
    }

    return new StaffDto
    {
        Id = user.Id,
        FullName = fullName,
        Email = user.Email ?? "",
        Role = role
    };
}

}