
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SmartQueue.Application.DTOs.Staff;
using SmartQueue.Application.Interfaces;
using SmartQueue.Domain.Entities;
using SmartQueue.Infrastructure.Data;
using SmartQueue.Infrastructure.Identity;

namespace SmartQueue.Infrastructure.Services;

public class StaffScheduleService : IStaffScheduleService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public StaffScheduleService(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<StaffScheduleDto?> GetScheduleAsync(
        string staffId)
    {
        var user = await FindStaffAsync(staffId);

        if (user == null)
            return null;

        var schedule = await LoadScheduleAsync(staffId);

        if (schedule == null)
        {
            return new StaffScheduleDto
            {
                StaffId = staffId
            };
        }

        return MapToDto(schedule);
    }

    public async Task<StaffScheduleDto?> UpdateScheduleAsync(
        string staffId,
        UpdateStaffScheduleDto dto)
    {
        var user = await FindStaffAsync(staffId);

        if (user == null)
            return null;

        ValidateSchedule(dto);

        var serviceIds = dto.QualifiedServiceIds
            .Distinct()
            .ToList();

        var activeServiceIds = await _context.Services
            .Where(s => serviceIds.Contains(s.Id) && s.Active)
            .Select(s => s.Id)
            .ToListAsync();

        if (activeServiceIds.Count != serviceIds.Count)
        {
            throw new ArgumentException(
                "One or more selected services are inactive or do not exist."
            );
        }

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        var schedule = await LoadScheduleAsync(staffId);

        if (schedule == null)
        {
            schedule = new StaffSchedule
            {
                StaffId = staffId
            };

            _context.StaffSchedules.Add(schedule);

            await _context.SaveChangesAsync();
        }


               // Replace weekly intervals
        var oldIntervals = schedule.WeeklyIntervals.ToList();

        _context.WeeklyIntervals.RemoveRange(oldIntervals);

        // Execute deletion before adding new intervals
        await _context.SaveChangesAsync();

        foreach (var interval in dto.WeeklyIntervals)
        {
            _context.WeeklyIntervals.Add(new WeeklyInterval
            {
                StaffScheduleId = schedule.Id,
                DayOfWeek = interval.DayOfWeek,
                From = interval.From,
                To = interval.To
            });
        }

        // Update specific days off
        var requestedDaysOff = dto.DaysOff.ToHashSet();

        var daysOffToRemove = schedule.DaysOff
            .Where(d => !requestedDaysOff.Contains(d.Date))
            .ToList();

        _context.StaffDaysOff.RemoveRange(daysOffToRemove);

        var existingDaysOff = schedule.DaysOff
            .Select(d => d.Date)
            .ToHashSet();

        foreach (var date in requestedDaysOff)
        {
            if (!existingDaysOff.Contains(date))
            {
                schedule.DaysOff.Add(new StaffDayOff
                {
                    Date = date
                });
            }
        }


        // Update qualified services
        var existingServiceIds = schedule.StaffScheduleServices
            .Select(x => x.ServiceId)
            .ToHashSet();

        var servicesToRemove = schedule.StaffScheduleServices
            .Where(x => !serviceIds.Contains(x.ServiceId))
            .ToList();

        _context.StaffScheduleServices.RemoveRange(servicesToRemove);

        foreach (var serviceId in serviceIds)
        {
            if (!existingServiceIds.Contains(serviceId))
            {
                schedule.StaffScheduleServices.Add(
                    new SmartQueue.Domain.Entities.StaffScheduleService
                    {
                        ServiceId = serviceId
                    }
                );
            }
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return MapToDto(schedule);
    }

    private async Task<ApplicationUser?> FindStaffAsync(
        string staffId)
    {
       var user = await _userManager.FindByIdAsync(staffId);

if (user == null)
    return null;

       var isStaff =
    await _userManager.IsInRoleAsync(user, "Staff");

var isReceptionist =
    await _userManager.IsInRoleAsync(user, "Receptionist");

if (!isStaff && !isReceptionist)
    return null;

    return user;
    }

    private async Task<StaffSchedule?> LoadScheduleAsync(
        string staffId)
    {
        return await _context.StaffSchedules
            .Include(s => s.WeeklyIntervals)
            .Include(s => s.DaysOff)
            .Include(s => s.StaffScheduleServices)
            .AsSplitQuery()
            .FirstOrDefaultAsync(s => s.StaffId == staffId);
    }

    private static void ValidateSchedule(
        UpdateStaffScheduleDto dto)
    {
        if (dto.WeeklyIntervals == null ||
            dto.DaysOff == null ||
            dto.QualifiedServiceIds == null)
        {
            throw new ArgumentException(
                "Schedule collections cannot be null."
            );
        }

        foreach (var interval in dto.WeeklyIntervals)
        {
            if (!Enum.IsDefined(interval.DayOfWeek))
            {
                throw new ArgumentException(
                    "Invalid weekday."
                );
            }

            if (interval.From >= interval.To)
            {
                throw new ArgumentException(
                    "Interval end time must be after start time."
                );
            }
        }

        foreach (var group in dto.WeeklyIntervals
            .GroupBy(i => i.DayOfWeek))
        {
            var ordered = group
                .OrderBy(i => i.From)
                .ToList();

            for (int i = 1; i < ordered.Count; i++)
            {
                if (ordered[i].From < ordered[i - 1].To)
                {
                    throw new ArgumentException(
                        $"Overlapping intervals on {group.Key}."
                    );
                }
            }
        }

        if (dto.QualifiedServiceIds.Any(id => id <= 0))
        {
            throw new ArgumentException(
                "Invalid service ID."
            );
        }
    }

    private static StaffScheduleDto MapToDto(
        StaffSchedule schedule)
    {
        return new StaffScheduleDto
        {
            StaffId = schedule.StaffId,

            WeeklyIntervals = schedule.WeeklyIntervals
                .OrderBy(i => i.DayOfWeek)
                .ThenBy(i => i.From)
                .Select(i => new WeeklyIntervalDto
                {
                    DayOfWeek = i.DayOfWeek,
                    From = i.From,
                    To = i.To
                })
                .ToList(),

            DaysOff = schedule.DaysOff
                .Select(d => d.Date)
                .OrderBy(d => d)
                .ToList(),

            QualifiedServiceIds = schedule.StaffScheduleServices
                .Select(s => s.ServiceId)
                .OrderBy(id => id)
                .ToList()
        };
    }
}
