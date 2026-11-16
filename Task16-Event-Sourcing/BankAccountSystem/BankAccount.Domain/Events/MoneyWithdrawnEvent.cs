namespace BankAccount.Domain.Events;

public record MoneyWithdrawnEvent(
    decimal Amount
) : IDomainEvent;