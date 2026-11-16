namespace BankAccount.Domain.Events;

public record MoneyDepositedEvent(
    decimal Amount
) : IDomainEvent;