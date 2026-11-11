using MediatR;
using TaskManagement.Application.Events;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Events;

namespace TaskManagement.Application.Tasks.Commands.CompleteTask;

public class CompleteTaskCommandHandler
    : IRequestHandler<CompleteTaskCommand>
{
    private readonly ITaskRepository _repository;
    private readonly IDomainEventDispatcher _dispatcher;
    public CompleteTaskCommandHandler(
        ITaskRepository repository,
        IDomainEventDispatcher dispatcher)
    {
        _repository = repository;
        _dispatcher = dispatcher;
    }

    public async Task Handle(
        CompleteTaskCommand request,
        CancellationToken cancellationToken)
    {
        var task = await _repository.GetByIdAsync(
            request.Id,
            cancellationToken);

        if (task is null)
            throw new KeyNotFoundException(
                "Task not found.");

        task.Complete();


        await _repository.SaveChangesAsync(
            cancellationToken);
        var domainEvents = task.DomainEvents.ToList();

        task.ClearDomainEvents();

        await _dispatcher.DispatchAsync(
            domainEvents,
            cancellationToken);
    }
}