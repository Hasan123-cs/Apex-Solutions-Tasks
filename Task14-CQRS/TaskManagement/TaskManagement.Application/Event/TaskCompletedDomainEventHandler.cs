using MediatR;
using TaskManagement.Domain.Events;

namespace TaskManagement.Application.Events;

public class TaskCompletedDomainEventHandler
    : INotificationHandler<DomainEventNotification<TaskCompletedDomainEvent>>
{
    public Task Handle(
        DomainEventNotification<TaskCompletedDomainEvent> notification,
        CancellationToken cancellationToken)
    {

        var taskEvent = notification.DomainEvent;
        Console.WriteLine(
                $"Task Completed! Title: {taskEvent.TaskTitle}");

        return Task.CompletedTask;
    }
}