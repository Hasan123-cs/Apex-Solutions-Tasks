using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Infrastructure.Persistence;

namespace TaskManagement.Infrastructure.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly ApplicationDbContext _context;

    public TaskRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(
        TaskItem task,
        CancellationToken cancellationToken)
    {
        await _context.Tasks.AddAsync(
            task,
            cancellationToken);
    }

    public async Task<TaskItem?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await _context.Tasks
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task<IReadOnlyList<TaskItem>> GetAllAsync(
        bool? isCompleted,
        CancellationToken cancellationToken)
    {
        var query = _context.Tasks
            .AsNoTracking()
            .AsQueryable();

        if (isCompleted.HasValue)
        {
            query = query.Where(
                x => x.IsCompleted == isCompleted.Value);
        }

        return await query
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(
            cancellationToken);
    }
}