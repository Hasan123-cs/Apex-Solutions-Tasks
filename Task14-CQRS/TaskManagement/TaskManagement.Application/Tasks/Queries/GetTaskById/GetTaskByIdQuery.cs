using MediatR;
using TaskManagement.Application.Tasks.DTOs;

namespace TaskManagement.Application.Tasks.Queries.GetTaskById;

public record GetTaskByIdQuery(
    Guid Id
) : IRequest<TaskDto?>;