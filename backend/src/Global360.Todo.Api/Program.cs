using Global360.Todo.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// In-memory store registered as singleton so its state persists across requests.
builder.Services.AddSingleton<ITodoService, InMemoryTodoService>();

// CORS — allowed origins come from configuration (Cors:AllowedOrigins),
// with a sensible default for local development.
const string CorsPolicyName = "TodoAppFrontend";
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? new[] { "http://localhost:4200" };

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // OpenAPI spec served at /openapi/v1.json — paste into editor.swagger.io
    // or a Swagger viewer for a UI; we keep dependencies minimal here.
    app.MapOpenApi();
}

app.UseCors(CorsPolicyName);

app.MapControllers();

app.Run();

// Exposed so WebApplicationFactory<Program> in the integration tests can find it.
public partial class Program { }
