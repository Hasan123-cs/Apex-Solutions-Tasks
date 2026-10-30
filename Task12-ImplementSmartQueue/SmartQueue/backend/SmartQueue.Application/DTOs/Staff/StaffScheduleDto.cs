namespace SmartQueue.Application.DTOs.Staff;

public class StaffScheduleDto
{
    public string StaffId { get; set; } = string.Empty;

    public List<WeeklyIntervalDto> WeeklyIntervals { get; set; }
        = new();

    public List<DateOnly> DaysOff { get; set; }
        = new();

    public List<int> QualifiedServiceIds { get; set; }
        = new();
}