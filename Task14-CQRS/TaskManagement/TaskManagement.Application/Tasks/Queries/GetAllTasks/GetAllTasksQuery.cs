using MediatR;
using TaskManagement.Application.Tasks.DTOs;

namespace TaskManagement.Application.Tasks.Queries.GetAllTasks;

public record GetAllTasksQuery(
    bool? IsCompleted
) : IRequest<IReadOnlyList<TaskDto>>;