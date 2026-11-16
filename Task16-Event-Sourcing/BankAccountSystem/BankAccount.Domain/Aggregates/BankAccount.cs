using BankAccount.Domain.Events;

namespace BankAccount.Domain.Aggregates;

public class BankAccount
{
    public Guid Id { get; private set; }

    public decimal Balance { get; private set; }

    public int Version { get; private set; }

    private readonly List<IDomainEvent> _changes = new();

    public IReadOnlyList<IDomainEvent> Changes => _changes;

    private BankAccount()
    {
    }

    public static BankAccount Open(
        Guid accountId,
        decimal initialBalance)
    {
        if (initialBalance < 0)
            throw new Exception("Initial balance cannot be negative.");

        var account = new BankAccount();

        account.Raise(
            new AccountOpenedEvent(
                accountId,
                initialBalance
            )
        );

        return account;
    }

    public void Deposit(decimal amount)
    {
        if (amount <= 0)
            throw new Exception("Deposit amount must be positive.");

        Raise(new MoneyDepositedEvent(amount));
    }

    public void Withdraw(decimal amount)
    {
        if (amount <= 0)
            throw new Exception("Withdrawal amount must be positive.");

        if (Balance < amount)
            throw new Exception("Insufficient balance.");

        Raise(new MoneyWithdrawnEvent(amount));
    }

    private void Raise(IDomainEvent domainEvent)
    {
        Apply(domainEvent);

        _changes.Add(domainEvent);

        Version++;
    }

    private void Apply(IDomainEvent domainEvent)
    {
        switch (domainEvent)
        {
            case AccountOpenedEvent opened:
                Id = opened.AccountId;
                Balance = opened.InitialBalance;
                break;

            case MoneyDepositedEvent deposited:
                Balance += deposited.Amount;
                break;

            case MoneyWithdrawnEvent withdrawn:
                Balance -= withdrawn.Amount;
                break;
        }
    }

    public static BankAccount FromHistory(
        IEnumerable<IDomainEvent> events)
    {
        var account = new BankAccount();

        foreach (var domainEvent in events)
        {
            account.Apply(domainEvent);
            account.Version++;
        }

        return account;
    }
}