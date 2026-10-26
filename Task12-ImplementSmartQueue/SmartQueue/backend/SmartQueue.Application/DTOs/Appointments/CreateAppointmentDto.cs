namespace SmartQueue.Application.DTOs.Appointments;

public class CreateAppointmentDto
{
    public int ServiceId { get; set; }

    public string StaffId { get; set; } = string.Empty;

    public DateOnly Date { get; set; }

    public TimeOnly StartTime { get; set; }
}