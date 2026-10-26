
namespace SmartQueue.Domain.Entities;

public class QueueEntry
{
    public int Id { get; set; }

    public int AppointmentId { get; set; }

    public DateOnly QueueDate { get; set; }


    public int QueueNumber { get; set; }

    public DateTime? CheckedInAt { get; set; }

    public DateTime? CalledAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public Appointment Appointment { get; set; } = null!;
}
