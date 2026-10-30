namespace SmartQueue.Application.DTOs.Staff;

public class UpdateStaffScheduleDto
{
    public List<WeeklyIntervalDto> WeeklyIntervals { get; set; }
        = new();

    public List<DateOnly> DaysOff { get; set; }
        = new();

    public List<int> QualifiedServiceIds { get; set; }
        = new();
}