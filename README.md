# Global360 TODO

A small full-stack TODO list, built as a take-home assignment.

[![ci](https://github.com/harvey-zhu-mel/global360-todo-app/actions/workflows/ci.yml/badge.svg)](https://github.com/harvey-zhu-mel/global360-todo-app/actions/workflows/ci.yml)

- **Backend:** ASP.NET Core 10 Web API, in-memory store
- **Frontend:** Angular 21, standalone components + signals, plain CSS
- **Tests:** xUnit + `WebApplicationFactory` on the backend, Vitest + jsdom (via `@angular/build:unit-test`) on the frontend
- **CI:** GitHub Actions on Ubuntu

## Prerequisites

Only two things are required:

| Tool       | Version       | Why                                                |
| ---------- | ------------- | -------------------------------------------------- |
| .NET SDK   | **10.0 LTS**  | Builds and runs the API; brings the `dotnet` CLI.  |
| Node.js    | **24 LTS**    | Builds and serves the Angular app; brings `npm`.   |

No global Angular CLI install is needed — `npx ng …` invokes the local copy installed by `npm install`.

Install commands per OS (pick one):

```bash
# macOS
brew install --cask dotnet-sdk
brew install node@24

# Windows (PowerShell)
winget install Microsoft.DotNet.SDK.10
winget install OpenJS.NodeJS.LTS

# Linux (Ubuntu)
sudo apt-get install -y dotnet-sdk-10.0
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify (identical on every OS):

```bash
dotnet --version    # 10.0.x
node --version      # v24.x
npm --version       # 10.x or newer
```

## Running the project

The API and the Angular dev server run in two separate terminals.

```bash
# Terminal 1 — backend on http://localhost:5000
cd backend
dotnet run --project src/Global360.Todo.Api
```

```bash
# Terminal 2 — frontend on http://localhost:4200
cd frontend/todo-app
npm install
npm start
```

Open `http://localhost:4200` in a browser. The OpenAPI spec is served at `http://localhost:5000/openapi/v1.json` (paste it into [editor.swagger.io](https://editor.swagger.io) for an interactive UI).

## Running the tests

```bash
# Backend — 18 tests (10 unit + 8 integration)
cd backend
dotnet test

# Frontend — 13 tests (service, form, item, list, app)
cd frontend/todo-app
npx ng test --watch=false
```

The same commands run in CI on every push.

## API surface

| Method | Path                | Body                | Response                  |
| ------ | ------------------- | ------------------- | ------------------------- |
| GET    | `/api/todos`        | —                   | `200 OK` + `TodoResponse[]` |
| POST   | `/api/todos`        | `{ "title": "..." }`| `201 Created` + `TodoResponse` + `Location` header |
| DELETE | `/api/todos/{id}`   | —                   | `204 No Content` or `404 Not Found` |

`TodoResponse` shape:

```jsonc
{
  "id": "11111111-1111-1111-1111-111111111111",
  "title": "buy milk",
  "createdAt": "2026-05-13T12:00:00+00:00"
}
```

Validation errors are returned as RFC 7807 `ValidationProblemDetails` with HTTP 400.

## Project structure

```
global360-todo-app/
├── .editorconfig
├── .gitattributes              # text=auto eol=lf for cross-OS line endings
├── .gitignore
├── README.md
├── .github/workflows/ci.yml    # Ubuntu CI: dotnet test + ng test + ng build
├── backend/
│   ├── Global360.Todo.slnx     # .NET 10 solution
│   ├── src/Global360.Todo.Api/
│   │   ├── Contracts/          # request/response DTOs
│   │   ├── Controllers/TodosController.cs
│   │   ├── Models/TodoItem.cs
│   │   ├── Services/{ITodoService.cs, InMemoryTodoService.cs}
│   │   ├── Program.cs          # CORS, OpenAPI, DI, partial for tests
│   │   └── appsettings.json    # Cors:AllowedOrigins (configurable)
│   └── tests/
│       ├── Global360.Todo.Api.UnitTests/         # xunit + FluentAssertions
│       └── Global360.Todo.Api.IntegrationTests/  # WebApplicationFactory
└── frontend/todo-app/
    ├── package.json
    ├── angular.json
    └── src/app/
        ├── app.{ts,html,css,spec.ts}
        ├── app.config.ts                # HttpClient + API_BASE_URL provider
        ├── core/
        │   ├── models/todo.model.ts
        │   ├── services/{todo.service.ts, todo.service.spec.ts}
        │   └── tokens/api-base-url.token.ts
        └── features/todo-list/
            ├── todo-form.component.{ts,css,spec.ts}
            ├── todo-item.component.{ts,css,spec.ts}
            └── todo-list.component.{ts,css,spec.ts}
```

## Design notes

**In-memory storage.** Todos live in a `ConcurrentDictionary<Guid, TodoItem>` on the API process, with a separate `ConcurrentQueue<Guid>` recording insertion order. Restarting the API resets the list — intentional per the assignment.

**Test coverage.** Backend unit tests cover the in-memory service behavior, including validation, deletion, ordering, and concurrent adds. Backend integration tests exercise the real HTTP endpoints through `WebApplicationFactory`. Frontend tests cover the API service and the form, item, list, and app components.

**Service abstraction.** The controller depends on `ITodoService`, not the concrete `InMemoryTodoService`. A future EF Core (or any other persistence) implementation drops in by changing one line in `Program.cs`.

**CORS is configuration-driven.** `appsettings.json` carries `Cors:AllowedOrigins` (default `http://localhost:4200`); production deployments override it via environment variables (`Cors__AllowedOrigins__0=https://your-domain.example`) without code changes.

**Cross-OS support.** `.gitattributes` normalizes line endings, `.editorconfig` aligns indentation, no shell-operator chaining in npm scripts, all paths use `Path.Combine` or forward slashes. The project clones and runs on macOS, Windows, and Linux from the same source.

**Minimum dependencies.** Only `npm install` (frontend) and `dotnet restore` (backend, run automatically by `dotnet run`) are required to bootstrap. No global Angular CLI, no Docker, no Make, no shell scripts — those would all violate the assignment's instructions about extra setup.

## Cloud / container deployment (optional)

The stack is cloud-ready as-is:

- **API:** `dotnet publish -c Release -r linux-x64 --self-contained false` produces a portable bundle that runs anywhere ASP.NET Core 10 is supported.
- **SPA:** `npx ng build` produces a static bundle in `frontend/todo-app/dist/todo-app/` that any web server (nginx, Cloudfront, S3, etc.) can serve.

Wire the SPA to call the API via the `API_BASE_URL` provider in `app.config.ts` (or via an environment file build configuration if you prefer).

## License

MIT.
