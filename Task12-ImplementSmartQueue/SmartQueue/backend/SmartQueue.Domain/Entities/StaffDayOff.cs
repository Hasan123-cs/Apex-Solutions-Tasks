
namespace SmartQueue.Domain.Entities;

public class StaffDayOff
{
    public int Id { get; set; }

    public int StaffScheduleId { get; set; }

    public DateOnly Date { get; set; }

    public StaffSchedule StaffSchedule { get; set; } = null!;
}
