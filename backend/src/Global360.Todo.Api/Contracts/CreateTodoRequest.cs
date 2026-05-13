using System.ComponentModel.DataAnnotations;

namespace Global360.Todo.Api.Contracts;

/// <summary>
/// Inbound payload for creating a TODO item.
/// </summary>
public sealed class CreateTodoRequest
{
    /// <summary>Human-readable task description. Required, max 500 chars.</summary>
    [Required(AllowEmptyStrings = false, ErrorMessage = "Title is required.")]
    [StringLength(500, MinimumLength = 1, ErrorMessage = "Title must be 1–500 characters.")]
    public string Title { get; init; } = string.Empty;
}
