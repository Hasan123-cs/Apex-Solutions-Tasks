using System;
using System.Collections.Generic;
using System.Text;
using AppointmentManagement.Domain.Events;
using MediatR;
namespace AppointmentManagement.Application.Events
{
    public class DomainEventDispatcher : IDomainEventDispatcher
    {
        private readonly IPublisher _publisher;

        public DomainEventDispatcher(IPublisher publisher)
        {
            _publisher = publisher;
        }
        public async Task DispatchAsync(
    IEnumerable<IDomainEvent> domainEvents,
    CancellationToken cancellationToken = default)
        {
            foreach (var domainEv in domainEvents)
            {
                var notificationType = typeof(DomainEventNotification<>)
                    .MakeGenericType(domainEv.GetType());

                var notification = Activator.CreateInstance(
                    notificationType, domainEv);

                if (notification is INotification domainEventNotification)
                {
                    await _publisher.Publish(
                        domainEventNotification,
                        cancellationToken);
                }
            }
        }
    }
}
