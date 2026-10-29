
using Microsoft.EntityFrameworkCore;
using SmartQueue.Application.DTOs.Queue;
using SmartQueue.Application.Interfaces;
using SmartQueue.Infrastructure.Data;
using SmartQueue.Domain.Enums;

namespace SmartQueue.Infrastructure.Services;

public class QueueService : IQueueService
{
    private readonly ApplicationDbContext _context;
    private readonly QueuePriorityStore _priorityStore;

   public QueueService(
    ApplicationDbContext context,
    QueuePriorityStore priorityStore)
{
    _context = context;
    _priorityStore = priorityStore;
}

    

public async Task<List<QueueEntryDto>> GetTodayQueueAsync()
{
    var today = DateOnly.FromDateTime(DateTime.Now);
    var now = DateTime.UtcNow;

    // 1. Load today's queue with appointment and service
    var entries = await _context.QueueEntries
        .AsNoTracking()
        .Include(q => q.Appointment)
            .ThenInclude(a => a.Service)
        .Where(q => q.QueueDate == today)
        .OrderBy(q => q.CheckedInAt)
        .ThenBy(q => q.QueueNumber)
        .ToListAsync();

    // 2. Get waiting customers
    var waiting = entries
        .Where(q =>
            q.Appointment.Status == AppointmentStatus.CheckedIn)
        .OrderBy(q => q.CheckedInAt)
        .ThenBy(q => q.QueueNumber)
        .ToList();

    // 3. Apply Admin priority
    var orderedIds = _priorityStore.ApplyOrder(
        today,
        waiting.Select(q => q.Id).ToList()
    );

    var positions = orderedIds
        .Select((id, index) => new { id, index })
        .ToDictionary(x => x.id, x => x.index);

    // 4. Sort waiting customers by priority
    entries = entries
        .OrderBy(q =>
            q.Appointment.Status == AppointmentStatus.CheckedIn
                ? 0
                : 1)
        .ThenBy(q =>
            positions.GetValueOrDefault(
                q.Id, int.MaxValue))
        .ThenBy(q => q.QueueNumber)
        .ToList();

    // 5. Calculate estimated waiting times
    var estimates = new Dictionary<int, int>();

    var staffGroups = entries
        .GroupBy(q => q.Appointment.StaffId);

    foreach (var staffGroup in staffGroups)
    {
        double availableAfterMinutes = 0;

        // Find the customer currently being served
        var currentService = staffGroup
            .FirstOrDefault(q =>
                q.Appointment.Status ==
                AppointmentStatus.InProgress);

        if (currentService != null)
        {
            var duration = Math.Max(
                0,
                currentService.Appointment.Service.Duration);

            var elapsed = currentService.CalledAt.HasValue
                ? (now - currentService.CalledAt.Value)
                    .TotalMinutes
                : 0;

            availableAfterMinutes = Math.Max(
                0,
                duration - Math.Max(0, elapsed));
        }

        // Waiting customers for this staff,
        // following Admin priority order
        var staffWaiting = staffGroup
            .Where(q =>
                q.Appointment.Status ==
                AppointmentStatus.CheckedIn)
            .OrderBy(q =>
                positions.GetValueOrDefault(
                    q.Id, int.MaxValue))
            .ThenBy(q => q.QueueNumber)
            .ToList();

        foreach (var customer in staffWaiting)
        {
            estimates[customer.Id] =
                (int)Math.Ceiling(availableAfterMinutes);

            // Add this customer's service duration
            // before calculating the next customer
            availableAfterMinutes += Math.Max(
                0,
                customer.Appointment.Service.Duration);
        }
    }

    // 6. Load customer and staff names
    var userIds = entries
        .SelectMany(q => new[]
        {
            q.Appointment.CustomerId,
            q.Appointment.StaffId
        })
        .Distinct()
        .ToList();

    var users = await _context.Users
        .AsNoTracking()
        .Where(u => userIds.Contains(u.Id))
        .ToDictionaryAsync(
            u => u.Id,
            u => u.UserName ?? u.Email ?? "Unknown"
        );

    // 7. Return queue DTOs with estimated times
    return entries.Select(q =>
    {
        int? estimatedMinutes =
            estimates.TryGetValue(q.Id, out var minutes)
                ? minutes
                : null;

        return new QueueEntryDto
        {
            Id = q.Id,
            AppointmentId = q.AppointmentId,
            Reference = q.Appointment.Reference,

            CustomerName = users.GetValueOrDefault(
                q.Appointment.CustomerId, "Unknown"),

            ServiceName = q.Appointment.Service.Name,

            StaffName = users.GetValueOrDefault(
                q.Appointment.StaffId, "Unknown"),

            QueueNumber = q.QueueNumber,
            CheckedInAt = q.CheckedInAt,
            CalledAt = q.CalledAt,
            CompletedAt = q.CompletedAt,

            Status = q.Appointment.Status.ToString(),

            EstimatedWaitMinutes = estimatedMinutes,

            EstimatedCallAt = estimatedMinutes.HasValue
                ? now.AddMinutes(estimatedMinutes.Value)
                : null
        };
    }).ToList();
}





public async Task CallQueueEntryAsync(
    int queueEntryId,
    string currentUserId,
    bool canManageAll)
{
    var queueEntry = await _context.QueueEntries
        .Include(q => q.Appointment)
        .FirstOrDefaultAsync(q => q.Id == queueEntryId);

    if (queueEntry == null)
        throw new KeyNotFoundException("Queue entry not found.");

    var today = DateOnly.FromDateTime(DateTime.Now);

    if (queueEntry.QueueDate != today)
        throw new InvalidOperationException(
            "Only today's queue entries can be called.");

    if (!canManageAll &&
        queueEntry.Appointment.StaffId != currentUserId)
        throw new UnauthorizedAccessException(
            "You can only call your own customers.");

    if (queueEntry.Appointment.Status != AppointmentStatus.CheckedIn)
        throw new InvalidOperationException(
            "Only waiting customers can be called.");

    // Check whether this staff member is already serving someone.
    var staffIsBusy = await _context.QueueEntries
        .AnyAsync(q =>
            q.QueueDate == today &&
            q.Appointment.StaffId ==
                queueEntry.Appointment.StaffId &&
            q.Appointment.Status == AppointmentStatus.InProgress);

    if (staffIsBusy)
        throw new InvalidOperationException(
            "This staff member is already serving a customer.");

    
// Get all waiting customers in original FIFO order
var allWaitingIds = await _context.QueueEntries
    .Where(q =>
        q.QueueDate == today &&
        q.Appointment.Status == AppointmentStatus.CheckedIn)
    .OrderBy(q => q.CheckedInAt)
    .ThenBy(q => q.QueueNumber)
    .Select(q => q.Id)
    .ToListAsync();

// Apply Admin priority
var priorityOrder = _priorityStore.ApplyOrder(
    today,
    allWaitingIds);

var staffWaitingIds = await _context.QueueEntries
    .Where(q =>
        q.QueueDate == today &&
        q.Appointment.StaffId ==
            queueEntry.Appointment.StaffId &&
        q.Appointment.Status == AppointmentStatus.CheckedIn)
    .Select(q => q.Id)
    .ToListAsync();

var staffWaitingSet = staffWaitingIds.ToHashSet();

var nextForStaff = priorityOrder
    .FirstOrDefault(id => staffWaitingSet.Contains(id));

if (nextForStaff != queueEntryId)
{
    throw new InvalidOperationException(
        "Please call the next customer for this staff member.");
}


    queueEntry.Appointment.Status = AppointmentStatus.InProgress;
    queueEntry.CalledAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();
}



public async Task CompleteQueueEntryAsync(
    int queueEntryId,
    string currentUserId,
    bool canManageAll)
{
    var queueEntry = await _context.QueueEntries
        .Include(q => q.Appointment)
        .FirstOrDefaultAsync(q => q.Id == queueEntryId);

    if (queueEntry == null)
        throw new KeyNotFoundException("Queue entry not found.");
    if (!canManageAll &&
    queueEntry.Appointment.StaffId != currentUserId)
{
    throw new UnauthorizedAccessException(
        "You can only complete your own customers.");
}
    var today = DateOnly.FromDateTime(DateTime.Now);

    if (queueEntry.QueueDate != today)
        throw new InvalidOperationException(
            "Only today's queue entries can be completed.");

    if (queueEntry.Appointment.Status != AppointmentStatus.InProgress)
        throw new InvalidOperationException(
            "Only customers in service can be completed.");

    queueEntry.Appointment.Status = AppointmentStatus.Completed;
    queueEntry.CompletedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();
}




public async Task ReorderQueueAsync(List<int> orderedIds)
{
    var today = DateOnly.FromDateTime(DateTime.Now);

    var waitingIds = await _context.QueueEntries
        .Where(q =>
            q.QueueDate == today &&
            q.Appointment.Status == AppointmentStatus.CheckedIn)
        .Select(q => q.Id)
        .ToListAsync();

    if (orderedIds == null ||
        orderedIds.Count != waitingIds.Count ||
        orderedIds.Distinct().Count() != orderedIds.Count ||
        !orderedIds.ToHashSet().SetEquals(waitingIds))
    {
        throw new InvalidOperationException(
            "The order must contain all waiting customers exactly once.");
    }

    _priorityStore.Reorder(today, orderedIds);
}
}
