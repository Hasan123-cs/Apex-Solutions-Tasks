using TaskManagement.Domain.Events;

public sealed record TaskCreatedDomainEvent(
    Guid TaskId,
    string TaskTitle,
    DateTime OccurredOn
) : IDomainEvent;