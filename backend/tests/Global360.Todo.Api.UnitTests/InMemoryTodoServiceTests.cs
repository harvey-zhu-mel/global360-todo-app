using FluentAssertions;
using Global360.Todo.Api.Models;
using Global360.Todo.Api.Services;

namespace Global360.Todo.Api.UnitTests;

/// <summary>
/// Tests for the in-memory implementation of <see cref="ITodoService"/>.
/// Each test gets a fresh service instance — the store is process-local but
/// per-test isolation keeps the suite independent.
/// </summary>
public class InMemoryTodoServiceTests
{
    private static ITodoService NewService() => new InMemoryTodoService();

    [Fact]
    public void GetAll_OnFreshService_ReturnsEmpty()
    {
        var service = NewService();

        var items = service.GetAll();

        items.Should().BeEmpty();
    }

    [Fact]
    public void Add_AssignsIdAndCreatedAtAndPreservesTitle()
    {
        var service = NewService();

        var created = service.Add("buy milk");

        created.Id.Should().NotBe(Guid.Empty);
        created.Title.Should().Be("buy milk");
        created.CreatedAt.Should().BeCloseTo(DateTimeOffset.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void Add_TrimsWhitespaceFromTitle()
    {
        var service = NewService();

        var created = service.Add("  buy milk  ");

        created.Title.Should().Be("buy milk");
    }

    [Fact]
    public void GetAll_AfterAdds_ReturnsAllItems()
    {
        var service = NewService();
        var a = service.Add("a");
        var b = service.Add("b");
        var c = service.Add("c");

        var items = service.GetAll().ToList();

        items.Should().HaveCount(3);
        items.Select(i => i.Id).Should().BeEquivalentTo(new[] { a.Id, b.Id, c.Id });
    }

    [Fact]
    public void Delete_RemovesExistingItemAndReturnsTrue()
    {
        var service = NewService();
        var a = service.Add("a");
        var b = service.Add("b");

        var deleted = service.Delete(a.Id);

        deleted.Should().BeTrue();
        service.GetAll().Should().ContainSingle().Which.Id.Should().Be(b.Id);
    }

    [Fact]
    public void Delete_OnMissingIdReturnsFalseAndLeavesStoreUntouched()
    {
        var service = NewService();
        var a = service.Add("a");

        var deleted = service.Delete(Guid.NewGuid());

        deleted.Should().BeFalse();
        service.GetAll().Should().ContainSingle().Which.Id.Should().Be(a.Id);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Add_OnEmptyOrWhitespaceTitleThrowsArgumentException(string? title)
    {
        var service = NewService();

        var act = () => service.Add(title!);

        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void ConcurrentAdds_AllSucceedWithDistinctIds()
    {
        var service = NewService();

        Parallel.For(0, 200, i => service.Add($"item-{i}"));

        var items = service.GetAll().ToList();
        items.Should().HaveCount(200);
        items.Select(i => i.Id).Distinct().Should().HaveCount(200);
    }
}
