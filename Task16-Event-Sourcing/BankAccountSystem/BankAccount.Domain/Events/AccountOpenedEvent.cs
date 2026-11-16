namespace BankAccount.Domain.Events;

public record AccountOpenedEvent(
    Guid AccountId,
    decimal InitialBalance
) : IDomainEvent;