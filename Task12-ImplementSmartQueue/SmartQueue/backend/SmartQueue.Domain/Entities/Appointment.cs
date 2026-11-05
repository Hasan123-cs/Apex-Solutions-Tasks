
using SmartQueue.Domain.Common;
using SmartQueue.Domain.Enums;
using SmartQueue.Domain.ValueObjects;

namespace SmartQueue.Domain.Entities;

public class Appointment : AggregateRoot<int>
{

    public string Reference { get; set; } = string.Empty;

    // Identity user IDs
    public string CustomerId { get; set; } = string.Empty;

    public string StaffId { get; set; } = string.Empty;

    public int ServiceId { get; set; }

    public DateTime Start { get; set; }

    public DateTime End { get; set; }

    public AppointmentStatus Status { get; private set; }
       = AppointmentStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Service Service { get; set; } = null!;

    public QueueEntry? QueueEntry { get; set; }
    public void Confirm(DateTime now)
    {
        if (Status != AppointmentStatus.Pending)
            throw new InvalidOperationException(
                "Only pending appointments can be confirmed.");

        if (Start <= now)
            throw new InvalidOperationException(
                "Past or started appointments cannot be confirmed.");

        Status = AppointmentStatus.Confirmed;
    }
    public void Cancel(DateTime now)
    {
        if (Status != AppointmentStatus.Pending &&
            Status != AppointmentStatus.Confirmed)
        {
            throw new InvalidOperationException(
                "Only pending or confirmed appointments can be cancelled.");
        }

        if (Start <= now)
        {
            throw new InvalidOperationException(
                "Past or started appointments cannot be cancelled.");
        }

        Status = AppointmentStatus.Cancelled;
    }


    public void Reschedule(
    AppointmentTimeRange newTimeRange,
    DateTime now,
    bool requireCurrentAppointmentInFuture)
    {
        if (Status != AppointmentStatus.Pending &&
            Status != AppointmentStatus.Confirmed)
        {
            throw new InvalidOperationException(
                "This appointment cannot be rescheduled.");
        }

        if (requireCurrentAppointmentInFuture && Start <= now)
        {
            throw new InvalidOperationException(
                "Past or started appointments cannot be rescheduled.");
        }

        if (newTimeRange.Start <= now)
        {
            throw new InvalidOperationException(
                "Cannot reschedule to a past time.");
        }

        if (newTimeRange.Start == Start)
        {
            throw new InvalidOperationException(
                "Please select a different appointment time.");
        }

        Start = newTimeRange.Start;
        End = newTimeRange.End;
        Status = AppointmentStatus.Pending;
    }
    public void CheckIn(DateOnly today)
    {
        if (Status != AppointmentStatus.Confirmed)
            throw new InvalidOperationException(
                "Only confirmed appointments can check in.");

        if (DateOnly.FromDateTime(Start) != today)
            throw new InvalidOperationException(
                "Check-in is only allowed on the appointment date.");

        Status = AppointmentStatus.CheckedIn;
    }
    public void StartService()
    {
        if (Status != AppointmentStatus.CheckedIn)
            throw new InvalidOperationException(
                "Only waiting customers can be called.");

        Status = AppointmentStatus.InProgress;
    }
    public void Complete()
    {
        if (Status != AppointmentStatus.InProgress)
            throw new InvalidOperationException(
                "Only customers in service can be completed.");

        Status = AppointmentStatus.Completed;
    }
    public void MarkAsNoShow(DateTime now)
    {
        if (Status != AppointmentStatus.Confirmed)
            throw new InvalidOperationException(
                "Only confirmed appointments can be marked as No-show.");

        if (Start > now)
            throw new InvalidOperationException(
                "Cannot mark No-show before the appointment starts.");

        Status = AppointmentStatus.NoShow;
    }
}
