namespace SmartQueue.Application.DTOs.Staff;

public class WeeklyIntervalDto
{
    public DayOfWeek DayOfWeek { get; set; }

    public TimeOnly From { get; set; }

    public TimeOnly To { get; set; }
}