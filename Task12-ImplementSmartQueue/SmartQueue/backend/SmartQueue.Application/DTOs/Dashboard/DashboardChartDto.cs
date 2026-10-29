
namespace SmartQueue.Application.DTOs.Dashboard;

public class DashboardChartDto
{
    public DateOnly Date { get; set; }

    public int TotalAppointments { get; set; }

    public int CompletedAppointments { get; set; }
}
