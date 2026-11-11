using TaskManagement.Domain.Events;

namespace TaskManagement.Application.Interfaces;

public interface IDomainEventDispatcher
{
    Task DispatchAsync(
        IEnumerable<IDomainEvent> domainEvents,
        CancellationToken cancellationToken = default);
}