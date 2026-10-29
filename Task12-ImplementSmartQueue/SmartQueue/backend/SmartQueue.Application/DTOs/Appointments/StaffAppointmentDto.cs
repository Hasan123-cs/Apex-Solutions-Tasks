namespace SmartQueue.Application.DTOs.Appointments;

public class StaffAppointmentDto
{
    public int Id { get; set; }

    public string Reference { get; set; } = string.Empty;

    public string CustomerId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;

    public int ServiceId { get; set; }
    public string ServiceName { get; set; } = string.Empty;

    public string StaffId { get; set; } = string.Empty;
    public string StaffName { get; set; } = string.Empty;

    public DateTime Start { get; set; }
    public DateTime End { get; set; }

    public string Status { get; set; } = string.Empty;

        public int? QueueNumber { get; set; }
    public DateTime? CheckedInAt { get; set; }
}