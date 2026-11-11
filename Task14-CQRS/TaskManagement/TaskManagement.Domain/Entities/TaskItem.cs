using TaskManagement.Domain.Common;
using TaskManagement.Domain.Events;

namespace TaskManagement.Domain.Entities;

public class TaskItem : BaseEntity
{
    public Guid Id { get; private set; }
    public string Title { get; private set; } = null!;
    public string? Description { get; private set; }
    public bool IsCompleted { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private TaskItem() { }

    public TaskItem(string title, string? description)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException(
                "Task title cannot be empty.");

        Id = Guid.NewGuid();
        Title = title.Trim();
        Description = description;
        IsCompleted = false;
        CreatedAt = DateTime.UtcNow;
        AddDomainEvent(
            new TaskCreatedDomainEvent(
                Id,
                Title,
                CreatedAt
            )
        );
    }

    public void Complete()
    {
        if (IsCompleted)
            throw new InvalidOperationException(
                "Task is already completed.");

        IsCompleted = true;
        AddDomainEvent(
           new TaskCompletedDomainEvent(
               Id,
               Title,
               DateTime.UtcNow
           )
       );
    }
}