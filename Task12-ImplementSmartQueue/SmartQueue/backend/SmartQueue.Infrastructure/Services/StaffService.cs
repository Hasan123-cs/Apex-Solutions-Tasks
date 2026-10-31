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
        FullName = string.IsNullOrWhiteSpace(user.FullName)
    ? user.Email ?? "Staff"
    : user.FullName,
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
    FullName = fullName,
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





    public async Task<StaffDto> UpdateStaffAsync(
    string id,
    UpdateStaffDto dto)
{
    var user = await _userManager.FindByIdAsync(id);

    if (user == null)
        throw new ArgumentException("Employee not found.");

    var roles = await _userManager.GetRolesAsync(user);

    if (!roles.Contains("Staff") &&
        !roles.Contains("Receptionist"))
    {
        throw new ArgumentException("Invalid employee account.");
    }

    if (dto.Role != "Staff" && dto.Role != "Receptionist")
        throw new ArgumentException("Invalid role.");

    if (string.IsNullOrWhiteSpace(dto.FullName) ||
        string.IsNullOrWhiteSpace(dto.Email))
    {
        throw new ArgumentException("Name and email are required.");
    }

    var existing = await _userManager.FindByEmailAsync(
        dto.Email.Trim());

    if (existing != null && existing.Id != id)
        throw new ArgumentException("Email already in use.");

    // Adjust this to your actual ApplicationUser name fields.
    var email = dto.Email.Trim();

user.FullName = dto.FullName.Trim();
user.UserName = email;
user.Email = email;

    var updateResult = await _userManager.UpdateAsync(user);

    if (!updateResult.Succeeded)
    {
        throw new ArgumentException(
            string.Join("; ",
                updateResult.Errors.Select(e => e.Description)));
    }

    if (!roles.Contains(dto.Role))
    {
        var removeResult = await _userManager.RemoveFromRolesAsync(
            user,
            roles.Where(r => r == "Staff" || r == "Receptionist"));

        if (!removeResult.Succeeded)
            throw new ArgumentException("Failed to remove old role.");

        var addResult = await _userManager.AddToRoleAsync(
            user, dto.Role);

        if (!addResult.Succeeded)
            throw new ArgumentException("Failed to assign new role.");
    }

    if (!string.IsNullOrWhiteSpace(dto.NewPassword))
    {
        var token = await _userManager.GeneratePasswordResetTokenAsync(
            user);

        var passwordResult = await _userManager.ResetPasswordAsync(
            user,
            token,
            dto.NewPassword);

        if (!passwordResult.Succeeded)
        {
            throw new ArgumentException(
                string.Join("; ",
                    passwordResult.Errors.Select(e => e.Description)));
        }
    }

    return new StaffDto
{
    Id = user.Id,
    FullName = user.FullName,
    Email = user.Email ?? "",
    Role = dto.Role
};
}

}