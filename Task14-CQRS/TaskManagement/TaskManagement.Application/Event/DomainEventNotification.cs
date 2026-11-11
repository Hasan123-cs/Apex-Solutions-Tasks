using MediatR;
using TaskManagement.Domain.Events;

namespace TaskManagement.Application.Events;

public class DomainEventNotification<TEvent> : INotification
    where TEvent : IDomainEvent
{
    public TEvent DomainEvent { get; }

    public DomainEventNotification(TEvent domainEvent)
    {
        DomainEvent = domainEvent;
    }
}