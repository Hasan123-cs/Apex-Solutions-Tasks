namespace TaskManagement.Domain.Entities;

public class TaskItem
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
    }

    public void Complete()
    {
        if (IsCompleted)
            throw new InvalidOperationException(
                "Task is already completed.");

        IsCompleted = true;
    }
}