using Microsoft.EntityFrameworkCore;
using SmartQueue.Application.DTOs.Appointments;
using SmartQueue.Application.Interfaces;
using SmartQueue.Domain.Entities;
using SmartQueue.Domain.Enums;
using SmartQueue.Infrastructure.Data;
using System.Globalization;

namespace SmartQueue.Infrastructure.Services;

public class AppointmentService : IAppointmentService
{
    private readonly ApplicationDbContext _context;
    private readonly IAvailabilityService _availabilityService;

    public AppointmentService(
        ApplicationDbContext context,
        IAvailabilityService availabilityService)
    {
        _context = context;
        _availabilityService = availabilityService;
    }

    public async Task<AppointmentResponseDto> CreateAppointmentAsync(
        CreateAppointmentDto dto,
        string customerId)
    {
        // 1. Find service
        var service = await _context.Services
            .FirstOrDefaultAsync(s =>
                s.Id == dto.ServiceId && s.Active);

        if (service == null || service.Duration <= 0)
            throw new ArgumentException("Invalid service.");

        // 2. Check selected time is available
        var slots = await _availabilityService.GetAvailableSlotsAsync(
            dto.ServiceId,
            dto.StaffId,
            dto.Date);

        var selectedTime = dto.StartTime.ToString("HH:mm");

        if (!slots.Any(s =>
            s.StartTime == selectedTime && s.IsAvailable))
        {
            throw new InvalidOperationException(
                "The selected time is no longer available.");
        }

        // 3. Calculate appointment start and end
        var start = dto.Date.ToDateTime(dto.StartTime);
        var end = start.AddMinutes(service.Duration);

        // 4. Create appointment
        var appointment = new Appointment
        {
            Reference = $"SQ-{Guid.NewGuid():N}",
            CustomerId = customerId,
            StaffId = dto.StaffId,
            ServiceId = dto.ServiceId,
            Start = start,
            End = end,
            Status = AppointmentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        // 5. Save in SQL Server
        _context.Appointments.Add(appointment);

        await _context.SaveChangesAsync();

        // 6. Return response
        return new AppointmentResponseDto
        {
            Id = appointment.Id,
            Reference = appointment.Reference,
            ServiceId = appointment.ServiceId,
            StaffId = appointment.StaffId,
            Start = appointment.Start,
            End = appointment.End,
            Status = appointment.Status.ToString()
        };
    }


    public async Task<List<MyAppointmentDto>> GetMyAppointmentsAsync(
    string customerId)
    {
        var appointments = await _context.Appointments
            .AsNoTracking()
            .Where(a => a.CustomerId == customerId)
            .Include(a => a.Service)
            .OrderByDescending(a => a.Start)
            .ToListAsync();

        var staffIds = appointments
            .Select(a => a.StaffId)
            .Distinct()
            .ToList();

        var staffUsers = await _context.Users
            .AsNoTracking()
            .Where(u => staffIds.Contains(u.Id))
            .ToListAsync();

        var staffNames = staffUsers.ToDictionary(
            u => u.Id,
            u => u.UserName ?? u.Email ?? "Staff");

        return appointments.Select(a => new MyAppointmentDto
        {
            Id = a.Id,
            Reference = a.Reference,

            ServiceId = a.ServiceId,
            StaffId = a.StaffId,

            ServiceName = a.Service.Name,
            StaffName = staffNames.GetValueOrDefault(a.StaffId, "Staff"),

            Start = a.Start,
            End = a.End,

            Price = a.Service.Price,
            Status = a.Status.ToString()
        }).ToList();
    }



    public async Task CancelAppointmentAsync(
    int appointmentId,
    string customerId)
    {
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a =>
                a.Id == appointmentId &&
                a.CustomerId == customerId);

        if (appointment == null)
        {
            throw new KeyNotFoundException(
                "Appointment not found.");
        }

        if (appointment.Status == AppointmentStatus.Cancelled)
        {
            throw new InvalidOperationException(
                "This appointment is already cancelled.");
        }

        if (appointment.Status == AppointmentStatus.Completed)
        {
            throw new InvalidOperationException(
                "Completed appointments cannot be cancelled.");
        }

        if (appointment.Start <= DateTime.Now)
        {
            throw new InvalidOperationException(
                "Past or started appointments cannot be cancelled.");
        }

        appointment.Status = AppointmentStatus.Cancelled;

        await _context.SaveChangesAsync();
    }


    public async Task RescheduleAppointmentAsync(
    int appointmentId,
    string customerId,
    RescheduleAppointmentDto dto)
    {
        // 1. Find the appointment belonging to this customer
        var appointment = await _context.Appointments
            .Include(a => a.Service)
            .FirstOrDefaultAsync(a =>
                a.Id == appointmentId &&
                a.CustomerId == customerId);

        if (appointment == null)
            throw new KeyNotFoundException("Appointment not found.");

        // 2. Check appointment status
        if (appointment.Status != AppointmentStatus.Pending &&
    appointment.Status != AppointmentStatus.Confirmed)
        {
            throw new InvalidOperationException(
                "This appointment cannot be rescheduled.");
        }

        if (appointment.Start <= DateTime.Now)
        {
            throw new InvalidOperationException(
                "Past or started appointments cannot be rescheduled.");
        }

        // 3. Validate new time
        if (!TimeOnly.TryParseExact(
            dto.StartTime,
            "HH:mm",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var time))
        {
            throw new ArgumentException("Invalid start time.");
        }

        if (dto.Date == default)
            throw new ArgumentException("Invalid date.");

        var newStart = dto.Date.ToDateTime(time);
        var newEnd = newStart.AddMinutes(appointment.Service.Duration);

        if (newStart <= DateTime.Now)
            throw new InvalidOperationException(
                "Cannot reschedule to a past time.");

        if (newStart == appointment.Start)
            throw new InvalidOperationException(
                "Please select a different appointment time.");

        // 4. Check available slots using your existing service
       
        var availableSlots = await _availabilityService.GetAvailableSlotsAsync(
            appointment.ServiceId,
            appointment.StaffId,
            dto.Date,appointment.Id);

        var available = availableSlots.Any(slot =>
            slot.StartTime == dto.StartTime &&
            slot.IsAvailable);

        if (!available)
            throw new InvalidOperationException(
                "The selected time is no longer available.");

        // 5. Update existing appointment
        appointment.Start = newStart;
        appointment.End = newEnd;

      
        await _context.SaveChangesAsync();
    }
}