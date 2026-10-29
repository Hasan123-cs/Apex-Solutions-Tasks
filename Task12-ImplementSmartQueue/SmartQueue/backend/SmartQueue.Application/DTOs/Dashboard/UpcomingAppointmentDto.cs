
namespace SmartQueue.Application.DTOs.Dashboard;

public class UpcomingAppointmentDto
{
    public int Id { get; set; }

    public string Reference { get; set; } = string.Empty;

    public DateTime Start { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public string ServiceName { get; set; } = string.Empty;

    public string StaffName { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;
}
