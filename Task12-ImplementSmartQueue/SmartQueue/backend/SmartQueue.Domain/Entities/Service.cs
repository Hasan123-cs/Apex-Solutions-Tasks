
namespace SmartQueue.Domain.Entities;

public class Service
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    // Duration in minutes
    public int Duration { get; set; }

    public decimal Price { get; set; }

    public bool Active { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Appointment> Appointments { get; set; }
        = new List<Appointment>();

    public ICollection<StaffScheduleService> StaffScheduleServices { get; set; }
        = new List<StaffScheduleService>();
}
