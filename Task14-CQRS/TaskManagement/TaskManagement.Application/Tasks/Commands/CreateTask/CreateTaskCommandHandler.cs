using MediatR;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Tasks.Commands.CreateTask;

public class CreateTaskCommandHandler
    : IRequestHandler<CreateTaskCommand, Guid>
{
    private readonly ITaskRepository _repository;

    public CreateTaskCommandHandler(
        ITaskRepository repository)
    {
        _repository = repository;
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

        return task.Id;
    }
}