using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Global360.Todo.Api.IntegrationTests;

/// <summary>
/// HTTP-level tests against the real Kestrel pipeline via WebApplicationFactory.
/// Each fact spins up a fresh server (via the IClassFixture) but the factory's
/// services are re-created per-test by re-instantiating it; see CreateFactory().
/// </summary>
public class TodosEndpointsTests
{
    // Re-create the factory each test so the singleton InMemoryTodoService starts empty.
    private static WebApplicationFactory<Program> CreateFactory() => new();

    private record TodoResponseDto(Guid Id, string Title, DateTimeOffset CreatedAt);
    private record CreateTodoRequestDto(string Title);

    [Fact]
    public async Task GetTodos_OnEmptyStore_Returns200AndEmptyArray()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/todos");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var items = await response.Content.ReadFromJsonAsync<List<TodoResponseDto>>();
        items.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public async Task PostTodos_WithValidTitle_Returns201WithBodyAndLocation()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/todos", new CreateTodoRequestDto("buy milk"));

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();

        var created = await response.Content.ReadFromJsonAsync<TodoResponseDto>();
        created.Should().NotBeNull();
        created!.Id.Should().NotBe(Guid.Empty);
        created.Title.Should().Be("buy milk");
        created.CreatedAt.Should().BeCloseTo(DateTimeOffset.UtcNow, TimeSpan.FromSeconds(5));

        // The Location header should point at GET /api/todos/{id} so a client can
        // retrieve the newly created resource. We don't implement that endpoint
        // here, but the convention is still worth enforcing in the response.
        response.Headers.Location!.ToString().Should().Contain(created.Id.ToString());
    }

    [Fact]
    public async Task PostTodos_TrimsTitle()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/todos", new CreateTodoRequestDto("  buy milk  "));

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await response.Content.ReadFromJsonAsync<TodoResponseDto>();
        created!.Title.Should().Be("buy milk");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task PostTodos_WithEmptyTitle_Returns400ProblemDetails(string title)
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/todos", new CreateTodoRequestDto(title));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        response.Content.Headers.ContentType?.MediaType
            .Should().BeOneOf("application/problem+json", "application/json");
    }

    [Fact]
    public async Task GetTodos_AfterAdds_ReturnsItemsInInsertionOrder()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        await client.PostAsJsonAsync("/api/todos", new CreateTodoRequestDto("a"));
        await client.PostAsJsonAsync("/api/todos", new CreateTodoRequestDto("b"));
        await client.PostAsJsonAsync("/api/todos", new CreateTodoRequestDto("c"));

        var items = await client.GetFromJsonAsync<List<TodoResponseDto>>("/api/todos");

        items.Should().NotBeNull();
        items!.Select(i => i.Title).Should().ContainInOrder("a", "b", "c");
    }

    [Fact]
    public async Task DeleteTodo_OnExistingItem_Returns204AndRemovesIt()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var created = await (await client.PostAsJsonAsync("/api/todos", new CreateTodoRequestDto("a")))
            .Content.ReadFromJsonAsync<TodoResponseDto>();

        var deleteResponse = await client.DeleteAsync($"/api/todos/{created!.Id}");

        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var items = await client.GetFromJsonAsync<List<TodoResponseDto>>("/api/todos");
        items.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public async Task DeleteTodo_OnMissingId_Returns404()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.DeleteAsync($"/api/todos/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
