namespace TaskManagement.Application.Tasks.DTOs;
// data return via our query 
public record TaskDto(
    Guid Id,
    string Title,
    string? Description,
    bool IsCompleted,
    DateTime CreatedAt
);