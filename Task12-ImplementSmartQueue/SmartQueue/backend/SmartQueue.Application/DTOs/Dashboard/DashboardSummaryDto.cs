
namespace SmartQueue.Application.DTOs.Dashboard;

public class DashboardSummaryDto
{
    public int TotalAppointments { get; set; }

    public int CompletedAppointments { get; set; }

    public int CancelledAppointments { get; set; }

    public int WaitingNow { get; set; }

    public decimal EstimatedRevenue { get; set; }
}
