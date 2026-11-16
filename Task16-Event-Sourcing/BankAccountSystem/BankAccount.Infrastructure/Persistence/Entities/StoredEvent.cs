namespace BankAccount.Infrastructure.Persistence.Entities;

public class StoredEvent
{
    public long Id { get; set; }

    public Guid AccountId { get; set; }

    public int Version { get; set; }

    public string EventType { get; set; } = string.Empty;

    public string EventData { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
        = DateTime.UtcNow;
}