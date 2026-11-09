
using SmartQueue.Domain.Common;

namespace SmartQueue.Domain.Entities;

public class WeeklyInterval : Entity<int>
{
    public int Id { get; set; }

    public int StaffScheduleId { get; set; }

    // Sunday = 0, Monday = 1, ...
    public DayOfWeek DayOfWeek { get; set; }

    public TimeOnly From { get; set; }

    public TimeOnly To { get; set; }

    public StaffSchedule StaffSchedule { get; set; } = null!;
}
