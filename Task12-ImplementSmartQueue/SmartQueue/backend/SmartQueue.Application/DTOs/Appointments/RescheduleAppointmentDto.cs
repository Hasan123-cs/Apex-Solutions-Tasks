namespace SmartQueue.Application.DTOs.Appointments;

public class RescheduleAppointmentDto
{
    public DateOnly Date { get; set; }
    public string StartTime { get; set; } = string.Empty;
}