namespace Global360.Todo.Api.Contracts;

/// <summary>
/// Outbound representation of a TODO item.
/// </summary>
public sealed record TodoResponse(Guid Id, string Title, DateTimeOffset CreatedAt);
