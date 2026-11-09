using SmartQueue.Domain.Common;

namespace SmartQueue.Domain.Entities;

public class StaffSchedule : AggregateRoot<int>
{
    private readonly List<WeeklyInterval> _weeklyIntervals = new();
    private readonly List<StaffDayOff> _daysOff = new();
    private readonly List<StaffScheduleService> _staffScheduleServices = new();

    public string StaffId { get; private set; } = string.Empty;

    public IReadOnlyCollection<WeeklyInterval> WeeklyIntervals
        => _weeklyIntervals.AsReadOnly();

    public IReadOnlyCollection<StaffDayOff> DaysOff
        => _daysOff.AsReadOnly();

    public IReadOnlyCollection<StaffScheduleService> StaffScheduleServices
        => _staffScheduleServices.AsReadOnly();

    private StaffSchedule() { }

    public StaffSchedule(string staffId)
    {
        if (string.IsNullOrWhiteSpace(staffId))
            throw new ArgumentException("Staff ID is required.");

        StaffId = staffId;
    }

    public void AddWeeklyInterval(
        DayOfWeek day,
        TimeOnly from,
        TimeOnly to)
    {
        if (from >= to)
            throw new InvalidOperationException(
                "Working interval end must be after start.");

        bool overlaps = _weeklyIntervals.Any(x =>
            x.DayOfWeek == day &&
            from < x.To &&
            to > x.From);

        if (overlaps)
            throw new InvalidOperationException(
                "Working intervals cannot overlap.");

        _weeklyIntervals.Add(new WeeklyInterval
        {
            DayOfWeek = day,
            From = from,
            To = to
        });
    }


    public void ReplaceWeeklyIntervals(
    IEnumerable<(DayOfWeek Day, TimeOnly From, TimeOnly To)> intervals)
    {
        var requested = intervals.ToList();

        foreach (var interval in requested)
        {
            if (!Enum.IsDefined(interval.Day))
                throw new ArgumentException("Invalid weekday.");

            if (interval.From >= interval.To)
                throw new ArgumentException(
                    "Interval end must be after start.");
        }

        foreach (var group in requested.GroupBy(x => x.Day))
        {
            var ordered = group.OrderBy(x => x.From).ToList();

            for (int i = 1; i < ordered.Count; i++)
            {
                if (ordered[i].From < ordered[i - 1].To)
                    throw new InvalidOperationException(
                        $"Overlapping intervals on {group.Key}.");
            }
        }

        _weeklyIntervals.Clear();

        foreach (var interval in requested)
        {
            _weeklyIntervals.Add(new WeeklyInterval
            {
                DayOfWeek = interval.Day,
                From = interval.From,
                To = interval.To
            });
        }
    }

    public void AddDayOff(DateOnly date)
    {
        if (_daysOff.Any(x => x.Date == date))
            throw new InvalidOperationException(
                "Day off already exists.");

        _daysOff.Add(new StaffDayOff
        {
            Date = date
        });
    }

    public void AddService(int serviceId)
    {
        if (serviceId <= 0)
            throw new ArgumentException("Invalid service ID.");

        if (_staffScheduleServices.Any(x =>
            x.ServiceId == serviceId))
            throw new InvalidOperationException(
                "Service already assigned.");

        _staffScheduleServices.Add(new StaffScheduleService
        {
            ServiceId = serviceId
        });
    }
    public void ReplaceDaysOff(IEnumerable<DateOnly> dates)
    {
        var requested = dates.Distinct().ToHashSet();

        _daysOff.RemoveAll(x => !requested.Contains(x.Date));

        var existing = _daysOff.Select(x => x.Date).ToHashSet();

        foreach (var date in requested)
        {
            if (!existing.Contains(date))
            {
                _daysOff.Add(new StaffDayOff
                {
                    Date = date
                });
            }
        }
    }

    public void ReplaceQualifiedServices(IEnumerable<int> serviceIds)
    {
        var requested = serviceIds.Distinct().ToHashSet();

        if (requested.Any(id => id <= 0))
            throw new ArgumentException("Invalid service ID.");

        _staffScheduleServices.RemoveAll(
            x => !requested.Contains(x.ServiceId));

        var existing = _staffScheduleServices
            .Select(x => x.ServiceId)
            .ToHashSet();

        foreach (var serviceId in requested)
        {
            if (!existing.Contains(serviceId))
            {
                _staffScheduleServices.Add(
                    new StaffScheduleService
                    {
                        ServiceId = serviceId
                    });
            }
        }
    }
}