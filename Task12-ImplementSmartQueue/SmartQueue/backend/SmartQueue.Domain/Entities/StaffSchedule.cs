
namespace SmartQueue.Domain.Entities;

public class StaffSchedule
{
    public int Id { get; set; }

    public string StaffId { get; set; } = string.Empty;

    // Working hours for each weekday
    public ICollection<WeeklyInterval> WeeklyIntervals { get; set; }
        = new List<WeeklyInterval>();

    // Staff unavailable dates
    public ICollection<StaffDayOff> DaysOff { get; set; }
        = new List<StaffDayOff>();

    // Services this staff member can provide
    public ICollection<StaffScheduleService> StaffScheduleServices { get; set; }
        = new List<StaffScheduleService>();
}
