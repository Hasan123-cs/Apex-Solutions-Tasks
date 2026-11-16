using BankAccount.Domain.Events;

namespace BankAccount.Application.Abstractions;

public interface IEventStore
{
    Task<List<IDomainEvent>> GetEventsAsync(
        Guid accountId,
        CancellationToken ct = default);

    Task AppendAsync(
        Guid accountId,
        int expectedVersion,
        IReadOnlyList<IDomainEvent> events,
        CancellationToken ct = default);
}