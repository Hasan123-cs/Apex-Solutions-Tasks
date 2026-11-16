using BankAccount.Application.Abstractions;
using BankAccount.Domain.Aggregates;

namespace BankAccount.Application.Commands.DepositMoney;

public class DepositMoneyCommandHandler
{
    private readonly IEventStore _eventStore;

    public DepositMoneyCommandHandler(IEventStore eventStore)
    {
        _eventStore = eventStore;
    }

    public async Task Handle(
        DepositMoneyCommand command,
        CancellationToken ct = default)
    {
        // 1. Load historical events
        var events = await _eventStore.GetEventsAsync(
            command.AccountId,
            ct
        );

        if (events.Count == 0)
            throw new Exception("Account not found.");

        // 2. Rebuild aggregate
        var account = BankAccount.Domain.Aggregates.BankAccount
            .FromHistory(events);

        // 3. Remember persisted version
        var expectedVersion = account.Version;

        // 4. Execute business operation
        account.Deposit(command.Amount);

        // 5. Save only new event
        await _eventStore.AppendAsync(
            command.AccountId,
            expectedVersion,
            account.Changes,
            ct
        );
    }
}