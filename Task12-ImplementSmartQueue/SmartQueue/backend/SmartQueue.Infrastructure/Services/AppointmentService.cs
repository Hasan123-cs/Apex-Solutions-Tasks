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
private readonly IEmailService _emailService;
    public AppointmentService(
        ApplicationDbContext context,
        IAvailabilityService availabilityService,IEmailService emailService)
    {
        _context = context;
        _availabilityService = availabilityService;
        _emailService = emailService;
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
    appointment.Status = AppointmentStatus.Pending;
      
        await _context.SaveChangesAsync();
    }


    public async Task<List<StaffAppointmentDto>> GetStaffAppointmentsAsync(
    string userId,
    bool canViewAll,
    DateOnly date)
{
    var dayStart = date.ToDateTime(TimeOnly.MinValue);
    var dayEnd = dayStart.AddDays(1);

    var query = _context.Appointments
        .AsNoTracking()
        .Include(a => a.Service)
        .Where(a =>
            a.Start >= dayStart &&
            a.Start < dayEnd);

    // Staff can only see their own appointments
    if (!canViewAll)
    {
        query = query.Where(a => a.StaffId == userId);
    }

    var appointments = await query
        .OrderBy(a => a.Start)
        .ToListAsync();

    // Get customer and staff names from Identity
    var userIds = appointments
        .SelectMany(a => new[] { a.CustomerId, a.StaffId })
        .Distinct()
        .ToList();

    var users = await _context.Users
        .AsNoTracking()
        .Where(u => userIds.Contains(u.Id))
        .ToListAsync();

    var userNames = users.ToDictionary(
        u => u.Id,
        u => u.UserName ?? u.Email ?? "Unknown");

    return appointments.Select(a => new StaffAppointmentDto
    {
        Id = a.Id,
        Reference = a.Reference,

        CustomerId = a.CustomerId,
        CustomerName = userNames.GetValueOrDefault(
            a.CustomerId, "Unknown"),

        ServiceId = a.ServiceId,
        ServiceName = a.Service.Name,

        StaffId = a.StaffId,
        StaffName = userNames.GetValueOrDefault(
            a.StaffId, "Unknown"),

        Start = a.Start,
        End = a.End,

        Status = a.Status.ToString()
    }).ToList();
}





public async Task ConfirmAppointmentAsync(int appointmentId)
{
    var appointment = await _context.Appointments
        .FirstOrDefaultAsync(a => a.Id == appointmentId);

    if (appointment == null)
        throw new KeyNotFoundException("Appointment not found.");

    if (appointment.Status != AppointmentStatus.Pending)
        throw new InvalidOperationException(
            "Only pending appointments can be confirmed.");

    if (appointment.Start <= DateTime.Now)
        throw new InvalidOperationException(
            "Past or started appointments cannot be confirmed.");

    var customer = await _context.Users
        .FirstOrDefaultAsync(u => u.Id == appointment.CustomerId);

    appointment.Status = AppointmentStatus.Confirmed;

    await _context.SaveChangesAsync();

    if (customer != null &&
        !string.IsNullOrWhiteSpace(customer.Email))
    {
      try
{
    await _emailService.SendEmailAsync(
        customer.Email!,
        "SmartQueue - Appointment Confirmed",
        $"Your appointment {appointment.Reference} has been confirmed."
    );

    Console.WriteLine(
        "Email accepted by SMTP server successfully."
    );
}
catch (Exception ex)
{
    Console.WriteLine(
        $"Email sending failed: {ex.Message}"
    );
}
    }
}

public async Task CancelAppointmentByStaffAsync(
    int appointmentId,
    string staffUserId)
{
    var appointment = await _context.Appointments
        .FirstOrDefaultAsync(a => a.Id == appointmentId);

    if (appointment == null)
        throw new KeyNotFoundException("Appointment not found.");

    if (appointment.Status != AppointmentStatus.Pending &&
        appointment.Status != AppointmentStatus.Confirmed)
    {
        throw new InvalidOperationException(
            "Only pending or confirmed appointments can be cancelled.");
    }

    if (appointment.Start <= DateTime.Now)
        throw new InvalidOperationException(
            "Past or started appointments cannot be cancelled.");

    appointment.Status = AppointmentStatus.Cancelled;

    await _context.SaveChangesAsync();
}


public async Task<int> CheckInAppointmentAsync(string reference)
{
    if (string.IsNullOrWhiteSpace(reference))
        throw new ArgumentException(
            "Appointment reference is required.");

    var appointment = await _context.Appointments
        .FirstOrDefaultAsync(a =>
            a.Reference == reference.Trim());

    if (appointment == null)
        throw new KeyNotFoundException(
            "Appointment not found.");

    if (appointment.Status != AppointmentStatus.Confirmed)
        throw new InvalidOperationException(
            "Only confirmed appointments can check in.");

    var today = DateOnly.FromDateTime(DateTime.Now);

    if (DateOnly.FromDateTime(appointment.Start) != today)
        throw new InvalidOperationException(
            "Check-in is only allowed on the appointment date.");

    // Find the highest queue number for today
    var lastQueueNumber = await _context.QueueEntries
        .Where(q => q.QueueDate == today)
        .MaxAsync(q => (int?)q.QueueNumber) ?? 0;

    var nextQueueNumber = lastQueueNumber + 1;

    var queueEntry = new QueueEntry
    {
        AppointmentId = appointment.Id,
        QueueDate = today,
        QueueNumber = nextQueueNumber,
        CheckedInAt = DateTime.UtcNow
    };

    appointment.Status = AppointmentStatus.CheckedIn;

    _context.QueueEntries.Add(queueEntry);

    await _context.SaveChangesAsync();

    return nextQueueNumber;
}



}