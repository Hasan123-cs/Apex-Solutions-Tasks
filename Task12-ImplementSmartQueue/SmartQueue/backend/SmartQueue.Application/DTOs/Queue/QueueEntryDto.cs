
namespace SmartQueue.Application.DTOs.Queue;

public class QueueEntryDto
{
    public int Id { get; set; }
    public int AppointmentId { get; set; }
    public string Reference { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public string StaffName { get; set; } = string.Empty;
    public int QueueNumber { get; set; }
    public DateTime? CheckedInAt { get; set; }
    public DateTime? CalledAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? EstimatedWaitMinutes { get; set; }

public DateTime? EstimatedCallAt { get; set; }
}
