using Microsoft.AspNetCore.Identity;

namespace SmartQueue.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Appointments as customer
    public ICollection<SmartQueue.Domain.Entities.Appointment>
        CustomerAppointments
    { get; set; }
        = new List<SmartQueue.Domain.Entities.Appointment>();

    // Appointments as staff
    public ICollection<SmartQueue.Domain.Entities.Appointment>
        StaffAppointments
    { get; set; }
        = new List<SmartQueue.Domain.Entities.Appointment>();

    // Staff schedule (only for staff users)
    public SmartQueue.Domain.Entities.StaffSchedule?
        StaffSchedule
    { get; set; }
}
