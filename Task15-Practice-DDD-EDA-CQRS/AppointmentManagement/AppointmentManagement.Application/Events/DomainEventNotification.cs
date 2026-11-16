using System;
using System.Collections.Generic;
using System.Text;
using AppointmentManagement.Domain.Events;
using MediatR;
namespace AppointmentManagement.Application.Events
{
    public  sealed record DomainEventNotification<TEvent> (TEvent DomainEvent) : INotification where TEvent : IDomainEvent
    {
    }
}
