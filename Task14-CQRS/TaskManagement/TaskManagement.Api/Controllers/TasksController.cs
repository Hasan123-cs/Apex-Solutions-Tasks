using MediatR;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.Tasks.Commands.CreateTask;
using TaskManagement.Application.Tasks.Commands.CompleteTask;
using TaskManagement.Application.Tasks.Queries.GetTaskById;
using TaskManagement.Application.Tasks.Queries.GetAllTasks;

namespace TaskManagement.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly ISender _sender;

    public TasksController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
      [FromBody] CreateTaskRequest request,
      CancellationToken cancellationToken)
    {
        try
        {
            var id = await _sender.Send(
                new CreateTaskCommand(
                    request.Title,
                    request.Description),
                cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id },
                new { id });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}/complete")]
    public async Task<IActionResult> Complete(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            await _sender.Send(
                new CompleteTaskCommand(id),
                cancellationToken);

            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var task = await _sender.Send(
            new GetTaskByIdQuery(id),
            cancellationToken);

        return task is null
            ? NotFound()
            : Ok(task);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] bool? isCompleted,
        CancellationToken cancellationToken)
    {
        var tasks = await _sender.Send(
            new GetAllTasksQuery(isCompleted),
            cancellationToken);

        return Ok(tasks);
    }
}

public record CreateTaskRequest(
    string Title,
    string? Description);