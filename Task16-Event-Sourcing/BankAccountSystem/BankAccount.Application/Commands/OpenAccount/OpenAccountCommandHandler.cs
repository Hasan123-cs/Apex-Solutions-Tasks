using BankAccount.Application.Abstractions;
using BankAccount.Domain.Aggregates;

namespace BankAccount.Application.Commands.OpenAccount;

public class OpenAccountCommandHandler
{
    private readonly IEventStore _eventStore;

    public OpenAccountCommandHandler(IEventStore eventStore)
    {
        _eventStore = eventStore;
    }

    public async Task<Guid> Handle(
        OpenAccountCommand command,
        CancellationToken ct = default)
    {
        var accountId = Guid.NewGuid();

        var account = BankAccount.Domain.Aggregates.BankAccount.Open(
            accountId,
            command.InitialBalance
        );

        await _eventStore.AppendAsync(
            accountId,
            expectedVersion: 0,
            account.Changes,
            ct
        );

        return accountId;
    }
}