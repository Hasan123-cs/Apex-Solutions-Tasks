namespace TaskManagement.Domain.Events;

public sealed record TaskCompletedDomainEvent(
    Guid TaskId,
    string TaskTitle,
    DateTime CompletedAt
) : IDomainEvent
{
    public DateTime OccurredOn => CompletedAt;
}