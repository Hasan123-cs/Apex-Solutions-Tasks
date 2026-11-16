namespace BankAccount.Domain.Snapshots;

public record BankAccountSnapshot(
    Guid AccountId,
    decimal Balance,
    int Version
);