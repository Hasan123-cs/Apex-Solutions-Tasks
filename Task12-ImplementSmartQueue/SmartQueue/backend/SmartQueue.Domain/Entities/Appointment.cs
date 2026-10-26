
using SmartQueue.Domain.Enums;

namespace SmartQueue.Domain.Entities;

public class Appointment
{
    public int Id { get; set; }

    public string Reference { get; set; } = string.Empty;

    // Identity user IDs
    public string CustomerId { get; set; } = string.Empty;

    public string StaffId { get; set; } = string.Empty;

    public int ServiceId { get; set; }

    public DateTime Start { get; set; }

    public DateTime End { get; set; }

    public AppointmentStatus Status { get; set; }
        = AppointmentStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Service Service { get; set; } = null!;

    public QueueEntry? QueueEntry { get; set; }
}
