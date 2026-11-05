namespace SmartQueue.Domain.ValueObjects;

public sealed record AppointmentTimeRange
{
    public DateTime Start { get; }
    public DateTime End { get; }

    public AppointmentTimeRange(DateTime start, DateTime end)
    {
        if (end <= start)
            throw new ArgumentException(
                "Appointment end must be after start.");

        Start = start;
        End = end;
    }
}