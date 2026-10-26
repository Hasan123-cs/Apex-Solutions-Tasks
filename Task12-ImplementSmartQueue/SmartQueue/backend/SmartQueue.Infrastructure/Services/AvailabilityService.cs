using Microsoft.EntityFrameworkCore;
using SmartQueue.Application.DTOs.Appointments;
using SmartQueue.Application.Interfaces;
using SmartQueue.Domain.Enums;
using SmartQueue.Infrastructure.Data;

namespace SmartQueue.Infrastructure.Services;

public class AvailabilityService : IAvailabilityService
{
    private readonly ApplicationDbContext _context;

    public AvailabilityService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AvailableSlotDto>> GetAvailableSlotsAsync(
        int serviceId,
        string staffId,
        DateOnly date,
            int? excludeAppointmentId = null)
    {
        var slots = new List<AvailableSlotDto>();

        // 1. Prevent past dates
        if (date < DateOnly.FromDateTime(DateTime.Today))
            return slots;

        // 2. Find active service
        var service = await _context.Services
            .AsNoTracking()
            .FirstOrDefaultAsync(s =>
                s.Id == serviceId && s.Active);

        if (service == null || service.Duration <= 0)
            return slots;

        // 3. Find staff schedule
        var schedule = await _context.StaffSchedules
            .AsNoTracking()
            .Include(s => s.WeeklyIntervals)
            .Include(s => s.DaysOff)
            .Include(s => s.StaffScheduleServices)
            .FirstOrDefaultAsync(s => s.StaffId == staffId);

        if (schedule == null)
            return slots;

        // 4. Check staff can provide this service
        bool canProvideService = schedule.StaffScheduleServices
            .Any(s => s.ServiceId == serviceId);

        if (!canProvideService)
            return slots;

        // 5. Check staff day off
        if (schedule.DaysOff.Any(d => d.Date == date))
            return slots;

        // 6. Get working intervals for selected day
        var workingIntervals = schedule.WeeklyIntervals
            .Where(w => w.DayOfWeek == date.DayOfWeek)
            .OrderBy(w => w.From)
            .ToList();

        if (workingIntervals.Count == 0)
            return slots;

        // 7. Get existing appointments
        var dayStart = date.ToDateTime(TimeOnly.MinValue);
        var dayEnd = dayStart.AddDays(1);

        var appointments = await _context.Appointments
     .AsNoTracking()
     .Where(a =>
         a.StaffId == staffId &&
         a.Start < dayEnd &&
         a.End > dayStart &&
         a.Status != AppointmentStatus.Cancelled &&
         (!excludeAppointmentId.HasValue ||
          a.Id != excludeAppointmentId.Value))
     .Select(a => new
     {
         a.Start,
         a.End
     })
     .ToListAsync();

        // 8. Generate time slots
        foreach (var interval in workingIntervals)
        {
            var current = date.ToDateTime(interval.From);
            var intervalEnd = date.ToDateTime(interval.To);

            while (current.AddMinutes(service.Duration) <= intervalEnd)
            {
                var slotEnd = current.AddMinutes(service.Duration);

                bool overlaps = appointments.Any(a =>
                    current < a.End && slotEnd > a.Start);

                bool isPast = current <= DateTime.Now;

                if (!overlaps && !isPast)
                {
                    slots.Add(new AvailableSlotDto
                    {
                        StartTime = current.ToString("HH:mm"),
                        IsAvailable = true
                    });
                }

                current = current.AddMinutes(service.Duration);
            }
        }

        return slots
            .GroupBy(s => s.StartTime)
            .Select(g => g.First())
            .OrderBy(s => s.StartTime)
            .ToList();
    }
}