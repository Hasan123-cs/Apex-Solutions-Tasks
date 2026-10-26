using Microsoft.AspNetCore.Identity;
using SmartQueue.Infrastructure.Identity;

namespace SmartQueue.Infrastructure.Data;

public static class SeedData
{
    public static async Task InitializeAsync(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        // Create Staff role if it doesn't exist
        if (!await roleManager.RoleExistsAsync("Staff"))
        {
            var roleResult = await roleManager.CreateAsync(
                new IdentityRole("Staff"));

            if (!roleResult.Succeeded)
                throw new Exception("Failed to create Staff role.");
        }

        // Create test staff account
        const string email = "staff1@smartqueue.test";

        var staff = await userManager.FindByEmailAsync(email);

        if (staff == null)
        {
            staff = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(
                staff,
                "Staff@12345");

            if (!result.Succeeded)
            {
                throw new Exception(
                    string.Join(", ",
                        result.Errors.Select(e => e.Description)));
            }
        }

        if (!await userManager.IsInRoleAsync(staff, "Staff"))
        {
            var result = await userManager.AddToRoleAsync(staff, "Staff");

            if (!result.Succeeded)
                throw new Exception("Failed to assign Staff role.");
        }
    }
}