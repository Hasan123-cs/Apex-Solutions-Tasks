using AppointmentManagement.Application.Events;
using AppointmentManagement.Domain.Events;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace AppointmentManagement.Application.EventHandlers
{
    public class AppointmentsCompleteCommandHandler : INotificationHandler<DomainEventNotification<AppointmentCompletedEvent>>
    {
        public Task Handle(DomainEventNotification<AppointmentCompletedEvent> notification, CancellationToken cancellationToken)
        {
            var notificationEvent = notification.DomainEvent;
            // simuliate ti the admin using signalR ... 
            Console.WriteLine($"""
                Appointment Completed Event Received:
                Appointment Id: {notificationEvent.AppointmentId}
                Patient Email: {notificationEvent.PatientEmail}
                """);
            return Task.CompletedTask;
        }
    }
}
