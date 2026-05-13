namespace Global360.Todo.Api.Models;

/// <summary>
/// A single TODO entry as stored in the in-memory service.
/// </summary>
/// <param name="Id">Server-assigned unique identifier.</param>
/// <param name="Title">The human-readable task description.</param>
/// <param name="CreatedAt">UTC timestamp at the moment the item was added.</param>
public sealed record TodoItem(Guid Id, string Title, DateTimeOffset CreatedAt);
