using MediatR;

namespace TaskManagement.Application.Tasks.Commands.CompleteTask;

public record CompleteTaskCommand(
    Guid Id
) : IRequest;