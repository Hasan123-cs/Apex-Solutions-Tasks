using MediatR;
using TaskManagement.Application.Events;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Tasks.Commands.CreateTask;

public class CreateTaskCommandHandler
    : IRequestHandler<CreateTaskCommand, Guid>
{
    private readonly ITaskRepository _repository;

    private readonly IDomainEventDispatcher _dispatcher;

    public CreateTaskCommandHandler(
        ITaskRepository repository,
        IDomainEventDispatcher publisher)
    {
        _repository = repository;
        _dispatcher = publisher;
    }
    public async Task<Guid> Handle(
        CreateTaskCommand request,
        CancellationToken cancellationToken)
    {
        var task = new TaskItem(
            request.Title,
            request.Description);

        await _repository.AddAsync(
            task,
            cancellationToken);

        await _repository.SaveChangesAsync(
            cancellationToken);

        var domainEvents = task.DomainEvents.ToList();

        task.ClearDomainEvents();

       await _dispatcher.DispatchAsync(
            domainEvents,
            cancellationToken);


        return task.Id;
    }
}