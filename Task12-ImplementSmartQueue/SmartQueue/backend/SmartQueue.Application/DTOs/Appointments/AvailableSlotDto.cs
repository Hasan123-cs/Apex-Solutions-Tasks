namespace SmartQueue.Application.DTOs.Appointments;

public class AvailableSlotDto
{
    public string StartTime { get; set; } = string.Empty;

    public bool IsAvailable { get; set; }
}