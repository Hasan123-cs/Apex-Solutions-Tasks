using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Interfaces;

public interface ITaskRepository
{
    Task AddAsync(
        TaskItem task,
        CancellationToken cancellationToken);

    Task<TaskItem?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<TaskItem>> GetAllAsync(
        bool? isCompleted,
        CancellationToken cancellationToken);

    Task SaveChangesAsync(
        CancellationToken cancellationToken);
}