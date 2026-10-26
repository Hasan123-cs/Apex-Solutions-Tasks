namespace SmartQueue.Application.DTOs.Appointments;

public class AppointmentResponseDto
{
    public int Id { get; set; }

    public string Reference { get; set; } = string.Empty;

    public int ServiceId { get; set; }

    public string StaffId { get; set; } = string.Empty;

    public DateTime Start { get; set; }

    public DateTime End { get; set; }

    public string Status { get; set; } = string.Empty;
}