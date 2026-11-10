using MediatR;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.Application.Tasks.Commands.CompleteTask;

public class CompleteTaskCommandHandler
    : IRequestHandler<CompleteTaskCommand>
{
    private readonly ITaskRepository _repository;

    public CompleteTaskCommandHandler(
        ITaskRepository repository)
    {
        _repository = repository;
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
    }
}