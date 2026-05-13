using System.Collections.Concurrent;
using Global360.Todo.Api.Models;

namespace Global360.Todo.Api.Services;

/// <summary>
/// In-memory <see cref="ITodoService"/> backed by a thread-safe dictionary.
/// State is process-local and is lost when the application restarts —
/// this is intentional for the assignment.
/// </summary>
public sealed class InMemoryTodoService : ITodoService
{
    // Two structures so insertion-order iteration is O(n) without locking.
    // The ConcurrentDictionary guards membership; the ConcurrentQueue records order.
    private readonly ConcurrentDictionary<Guid, TodoItem> _items = new();
    private readonly ConcurrentQueue<Guid> _order = new();

    public IEnumerable<TodoItem> GetAll()
    {
        foreach (var id in _order)
        {
            if (_items.TryGetValue(id, out var item))
            {
                yield return item;
            }
        }
    }

    public TodoItem Add(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new ArgumentException("Title must not be empty or whitespace.", nameof(title));
        }

        var item = new TodoItem(
            Id: Guid.NewGuid(),
            Title: title.Trim(),
            CreatedAt: DateTimeOffset.UtcNow);

        // Add to the dictionary first so GetAll never observes an order id with no item.
        _items[item.Id] = item;
        _order.Enqueue(item.Id);
        return item;
    }

    public bool Delete(Guid id) => _items.TryRemove(id, out _);
}
