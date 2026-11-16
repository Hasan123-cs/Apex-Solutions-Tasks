using AppointmentManagement.Application.Events;
using AppointmentManagement.Domain.Events;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace AppointmentManagement.Application.EventHandlers
{
    public sealed class AppointmentCreatedEmailHandler : INotificationHandler<DomainEventNotification<AppointmentCreatedEvent>>
    {
        public Task Handle(DomainEventNotification<AppointmentCreatedEvent> notification, CancellationToken cancellationToken)
        {
            var notificationEvent = notification.DomainEvent;
            Console.WriteLine($"""

                Appointment Created Event Received:
                Appointment Id: {notificationEvent.AppointmentId}
                Patient Email: {notificationEvent.PatientEmail}

                """);
            return Task.CompletedTask;
        }
    }
}
