using Global360.Todo.Api.Contracts;
using Global360.Todo.Api.Models;
using Global360.Todo.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Global360.Todo.Api.Controllers;

/// <summary>
/// REST endpoints for managing TODO items.
/// </summary>
[ApiController]
[Route("api/todos")]
[Produces("application/json")]
public sealed class TodosController : ControllerBase
{
    private readonly ITodoService _todos;
    private readonly ILogger<TodosController> _logger;

    public TodosController(ITodoService todos, ILogger<TodosController> logger)
    {
        _todos = todos;
        _logger = logger;
    }

    /// <summary>Returns every TODO item, in the order it was added.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TodoResponse>), StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<TodoResponse>> GetAll()
    {
        var items = _todos.GetAll().Select(ToResponse);
        return Ok(items);
    }

    /// <summary>Creates a new TODO item from the request body.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(TodoResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public ActionResult<TodoResponse> Create([FromBody] CreateTodoRequest request)
    {
        // ModelState already covers [Required]/[StringLength], but the service
        // does an additional whitespace check we surface as 400 too.
        try
        {
            var created = _todos.Add(request.Title);
            var response = ToResponse(created);

            _logger.LogInformation("Created todo {TodoId}", created.Id);

            return CreatedAtAction(
                actionName: nameof(GetAll),
                routeValues: new { id = created.Id },
                value: response);
        }
        catch (ArgumentException ex)
        {
            ModelState.AddModelError(nameof(CreateTodoRequest.Title), ex.Message);
            return ValidationProblem(ModelState);
        }
    }

    /// <summary>Removes the TODO item with the given id, if it exists.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Delete(Guid id)
    {
        var removed = _todos.Delete(id);
        if (!removed)
        {
            return NotFound();
        }

        _logger.LogInformation("Deleted todo {TodoId}", id);
        return NoContent();
    }

    private static TodoResponse ToResponse(TodoItem item) =>
        new(item.Id, item.Title, item.CreatedAt);
}
