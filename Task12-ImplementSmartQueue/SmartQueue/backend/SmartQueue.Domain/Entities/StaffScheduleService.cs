
namespace SmartQueue.Domain.Entities;

public class StaffScheduleService
{
    public int StaffScheduleId { get; set; }

    public int ServiceId { get; set; }

    public StaffSchedule StaffSchedule { get; set; } = null!;

    public Service Service { get; set; } = null!;
}
