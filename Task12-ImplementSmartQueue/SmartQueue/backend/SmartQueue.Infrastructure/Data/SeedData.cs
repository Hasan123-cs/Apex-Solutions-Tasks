
using Microsoft.AspNetCore.Identity;
using SmartQueue.Infrastructure.Identity;

namespace SmartQueue.Infrastructure.Data;

public static class SeedData
{
    public static async Task InitializeAsync(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        // 1. Create all roles
        string[] roles =
        {
            "Customer",
            "Staff",
            "Receptionist",
            "Admin"
        };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                var result = await roleManager.CreateAsync(
                    new IdentityRole(role));

                if (!result.Succeeded)
                {
                    throw new InvalidOperationException(
                        $"Failed to create role: {role}");
                }
            }
        }

        // 2. Create test Staff account
        await CreateUserAsync(
            userManager,
            email: "staff1@smartqueue.test",
            fullName: "Test Staff",
            role: "Staff",
            password: "Staff@12345");

        // 3. Create test Receptionist account
        await CreateUserAsync(
            userManager,
            email: "receptionist@smartqueue.test",
            fullName: "Front Desk Receptionist",
            role: "Receptionist",
            password: "Reception@12345");

        // 4. Create test Admin account
        await CreateUserAsync(
            userManager,
            email: "admin@smartqueue.test",
            fullName: "System Admin",
            role: "Admin",
            password: "Admin@12345");
    }

    private static async Task CreateUserAsync(
        UserManager<ApplicationUser> userManager,
        string email,
        string fullName,
        string role,
        string password)
    {
        // Check if user already exists
        var user = await userManager.FindByEmailAsync(email);

        if (user == null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FullName = fullName,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(
                user, password);

            if (!result.Succeeded)
            {
                throw new InvalidOperationException(
                    string.Join("; ",
                        result.Errors.Select(e => e.Description)));
            }
        }

        // Assign role if not already assigned
        if (!await userManager.IsInRoleAsync(user, role))
        {
            var result = await userManager.AddToRoleAsync(
                user, role);

            if (!result.Succeeded)
            {
                throw new InvalidOperationException(
                    $"Failed to assign {role} role to {email}");
            }
        }
    }
}
