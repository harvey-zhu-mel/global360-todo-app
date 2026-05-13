using Global360.Todo.Api.Models;

namespace Global360.Todo.Api.Services;

/// <summary>
/// Contract for storing and retrieving TODO items.
/// Implementations must be safe for concurrent use across requests.
/// </summary>
public interface ITodoService
{
    /// <summary>Returns every stored item, in insertion order.</summary>
    IEnumerable<TodoItem> GetAll();

    /// <summary>
    /// Creates a new item from the given title. Whitespace is trimmed; the
    /// result is rejected with <see cref="ArgumentException"/> if it is empty.
    /// </summary>
    TodoItem Add(string title);

    /// <summary>
    /// Removes the item with the given id. Returns true if an item was
    /// removed, false if no matching item existed.
    /// </summary>
    bool Delete(Guid id);
}
