using MediatR;
using TaskManagement.Application.Interfaces;
using TaskManagement.Application.Tasks.DTOs;

namespace TaskManagement.Application.Tasks.Queries.GetAllTasks;

public class GetAllTasksQueryHandler
    : IRequestHandler<GetAllTasksQuery, IReadOnlyList<TaskDto>>
{
    private readonly ITaskRepository _repository;

    public GetAllTasksQueryHandler(
        ITaskRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<TaskDto>> Handle(
        GetAllTasksQuery request,
        CancellationToken cancellationToken)
    {
        var tasks = await _repository.GetAllAsync(
            request.IsCompleted,
            cancellationToken);

        return tasks
            .Select(task => new TaskDto(
                task.Id,
                task.Title,
                task.Description,
                task.IsCompleted,
                task.CreatedAt))
            .ToList();
    }
}