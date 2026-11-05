
using SmartQueue.Domain.Common;

namespace SmartQueue.Domain.Entities;

public class QueueEntry : Entity<int>
{

    public int AppointmentId { get; set; }

    public DateOnly QueueDate { get; set; }


    public int QueueNumber { get; set; }

    public DateTime? CheckedInAt { get; set; }

    public DateTime? CalledAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public Appointment Appointment { get; set; } = null!;
    public void MarkCalled(DateTime now)
    {
        if (CalledAt.HasValue)
            throw new InvalidOperationException(
                "This queue entry has already been called.");

        CalledAt = now;
    }
    public void MarkCompleted(DateTime now)
    {
        if (!CalledAt.HasValue)
            throw new InvalidOperationException(
                "Cannot complete a queue entry before calling it.");

        if (CompletedAt.HasValue)
            throw new InvalidOperationException(
                "This queue entry is already completed.");

        CompletedAt = now;
    }
}
