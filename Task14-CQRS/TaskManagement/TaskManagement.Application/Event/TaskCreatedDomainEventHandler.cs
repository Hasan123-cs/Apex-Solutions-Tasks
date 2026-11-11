using MediatR;
using TaskManagement.Domain.Events;

namespace TaskManagement.Application.Events;

public class TaskCreatedDomainEventHandler
    : INotificationHandler<
        DomainEventNotification<TaskCreatedDomainEvent>>
{
    public Task Handle(
        DomainEventNotification<TaskCreatedDomainEvent> notification,
        CancellationToken cancellationToken)
    {
        var taskEvent = notification.DomainEvent;

        Console.WriteLine(
            $"New Task Created: {taskEvent.TaskTitle}");

        return Task.CompletedTask;
    }
}