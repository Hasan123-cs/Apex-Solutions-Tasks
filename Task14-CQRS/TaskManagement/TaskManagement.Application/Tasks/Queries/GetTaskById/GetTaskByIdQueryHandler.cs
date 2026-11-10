using MediatR;
using TaskManagement.Application.Interfaces;
using TaskManagement.Application.Tasks.DTOs;

namespace TaskManagement.Application.Tasks.Queries.GetTaskById;

public class GetTaskByIdQueryHandler
    : IRequestHandler<GetTaskByIdQuery, TaskDto?>
{
    private readonly ITaskRepository _repository;

    public GetTaskByIdQueryHandler(
        ITaskRepository repository)
    {
        _repository = repository;
    }

    public async Task<TaskDto?> Handle(
        GetTaskByIdQuery request,
        CancellationToken cancellationToken)
    {
        var task = await _repository.GetByIdAsync(
            request.Id,
            cancellationToken);

        if (task is null)
            return null;

        return new TaskDto(
            task.Id,
            task.Title,
            task.Description,
            task.IsCompleted,
            task.CreatedAt);
    }
}