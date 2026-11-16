using AppointmentManagement.Domain.Events;
using System;
using System.Collections.Generic;
using System.Text;

namespace AppointmentManagement.Application.Events
{
    public interface IDomainEventDispatcher
    {
        Task DispatchAsync(
       IEnumerable<IDomainEvent> domainEvents,
       CancellationToken cancellationToken = default);
    }
}
