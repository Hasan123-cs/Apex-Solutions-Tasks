
using Microsoft.EntityFrameworkCore;
using SmartQueue.Application.DTOs.Dashboard;
using SmartQueue.Domain.Enums;
using SmartQueue.Infrastructure.Data;

namespace SmartQueue.Infrastructure.Services.Dashboard;

public class DashboardService
{
    private readonly ApplicationDbContext _context;

    public DashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> GetStatsAsync(
        DateTime startDate,
        DateTime endDate)
    {
        if (startDate.Date > endDate.Date)
            throw new ArgumentException("Invalid date range.");

        var start = startDate.Date;
        var endExclusive = endDate.Date.AddDays(1);

        var today = DateOnly.FromDateTime(
            TimeZoneInfo.ConvertTimeBySystemTimeZoneId(
                DateTime.UtcNow,
                "Asia/Beirut"
            )
        );

        var appointments = _context.Appointments
            .AsNoTracking()
            .Where(a =>
                a.Start >= start &&
                a.Start < endExclusive);

        var total = await appointments.CountAsync();

        var completed = await appointments.CountAsync(a =>
            a.Status == AppointmentStatus.Completed);

        var cancelled = await appointments.CountAsync(a =>
            a.Status == AppointmentStatus.Cancelled);

        var waitingNow = await _context.QueueEntries
            .AsNoTracking()
            .CountAsync(q =>
                q.QueueDate == today &&
                q.Appointment.Status == AppointmentStatus.CheckedIn);

        // Revenue is based on today's completed visits only.
        var todayStart = today.ToDateTime(TimeOnly.MinValue);
        var tomorrowStart = todayStart.AddDays(1);

        var revenue = await _context.Appointments
            .AsNoTracking()
            .Where(a =>
                a.Start >= todayStart &&
                a.Start < tomorrowStart &&
                a.Status == AppointmentStatus.Completed)
            .SumAsync(a => (decimal?)a.Service.Price) ?? 0m;

        return new DashboardSummaryDto
        {
            TotalAppointments = total,
            CompletedAppointments = completed,
            CancelledAppointments = cancelled,
            WaitingNow = waitingNow,
            EstimatedRevenue = revenue
        };
    }


    
public async Task<List<DashboardChartDto>> GetChartAsync(
    DateTime startDate,
    DateTime endDate)
{
    if (startDate.Date > endDate.Date)
    {
        throw new ArgumentException("Invalid date range.");
    }

    var start = startDate.Date;
    var endExclusive = endDate.Date.AddDays(1);

    var appointments = await _context.Appointments
        .AsNoTracking()
        .Where(a =>
            a.Start >= start &&
            a.Start < endExclusive)
        .Select(a => new
        {
            a.Start,
            a.Status
        })
        .ToListAsync();

    var grouped = appointments
        .GroupBy(a => DateOnly.FromDateTime(a.Start))
        .ToDictionary(
            group => group.Key,
            group => new
            {
                Total = group.Count(),
                Completed = group.Count(a =>
                    a.Status == AppointmentStatus.Completed)
            });

    var result = new List<DashboardChartDto>();

    for (
        var date = DateOnly.FromDateTime(start);
        date < DateOnly.FromDateTime(endExclusive);
        date = date.AddDays(1)
    )
    {
        grouped.TryGetValue(date, out var stats);

        result.Add(new DashboardChartDto
        {
            Date = date,
            TotalAppointments = stats?.Total ?? 0,
            CompletedAppointments = stats?.Completed ?? 0
        });
    }

    return result;
}








public async Task<List<UpcomingAppointmentDto>>
    GetUpcomingAppointmentsAsync()
{
    var now = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(
        DateTime.UtcNow,
        "Asia/Beirut"
    );

    var tomorrow = now.Date.AddDays(1);

    var appointments = await _context.Appointments
        .AsNoTracking()
        .Where(a =>
            a.Start >= now &&
            a.Start < tomorrow &&
            (a.Status == AppointmentStatus.Pending ||
             a.Status == AppointmentStatus.Confirmed)
        )
        .OrderBy(a => a.Start)
        .Join(
            _context.Users,
            appointment => appointment.CustomerId,
            customer => customer.Id,
            (appointment, customer) => new
            {
                appointment,
                CustomerName = customer.FullName
            }
        )
        .Join(
            _context.Users,
            result => result.appointment.StaffId,
            staff => staff.Id,
            (result, staff) => new
            {
                result.appointment.Id,
                result.appointment.Reference,
                result.appointment.Start,
                result.CustomerName,
                StaffName = staff.FullName,
                ServiceName = result.appointment.Service.Name,
                result.appointment.Status
            }
        )
        .ToListAsync();

    return appointments.Select(a => new UpcomingAppointmentDto
    {
        Id = a.Id,
        Reference = a.Reference,
        Start = a.Start,
        CustomerName = a.CustomerName,
        StaffName = a.StaffName,
        ServiceName = a.ServiceName,
        Status = a.Status.ToString()
    }).ToList();
}


}
