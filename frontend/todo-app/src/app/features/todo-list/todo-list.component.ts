import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';

import { Todo } from '../../core/models/todo.model';
import { TodoService } from '../../core/services/todo.service';
import { TodoFormComponent } from './todo-form.component';
import { TodoItemComponent } from './todo-item.component';

/**
 * Top-level screen — owns the in-memory todo list signal, handles
 * service calls, and renders the form + the rows.
 */
@Component({
  selector: 'app-todo-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TodoFormComponent, TodoItemComponent],
  template: `
    <header>
      <h1>My todo list</h1>
      <p class="subtitle">Add and delete tasks. Stored on the server in memory.</p>
      <span class="counter">{{ count() }} {{ count() === 1 ? 'item' : 'items' }}</span>
    </header>

    @if (error()) {
      <div role="alert" class="error">{{ error() }}</div>
    }

    <app-todo-form (add)="onAdd($event)" />

    @if (loading() && todos().length === 0) {
      <p class="loading">Loading…</p>
    } @else if (todos().length === 0) {
      <p class="empty">No tasks yet — add your first one above.</p>
    } @else {
      <ul>
        @for (todo of todos(); track todo.id) {
          <li data-testid="todo-row">
            <app-todo-item [todo]="todo" (delete)="onDelete($event)" />
          </li>
        }
      </ul>
    }
  `,
  styleUrl: './todo-list.component.css',
})
export class TodoListComponent implements OnInit {
  private readonly service = inject(TodoService);

  protected readonly todos = signal<Todo[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly count = computed(() => this.todos().length);

  ngOnInit(): void {
    this.refresh();
  }

  protected refresh(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.list().subscribe({
      next: (items) => {
        this.todos.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.describe(err));
        this.loading.set(false);
      },
    });
  }

  protected onAdd(title: string): void {
    this.error.set(null);
    this.service.add(title).subscribe({
      // Append the new item so the local list matches the server's insertion
      // order (oldest → newest). Prepending here produced a different order
      // after add vs. after refresh — a small but visible inconsistency.
      next: (created) => this.todos.update((list) => [...list, created]),
      error: (err) => this.error.set(this.describe(err)),
    });
  }

  protected onDelete(id: string): void {
    this.error.set(null);
    this.service.remove(id).subscribe({
      next: () => this.todos.update((list) => list.filter((t) => t.id !== id)),
      error: (err) => this.error.set(this.describe(err)),
    });
  }

  private describe(err: unknown): string {
    if (err && typeof err === 'object' && 'status' in err) {
      const status = (err as { status?: number }).status;
      if (status === 0) {
        return "Couldn't reach the server. Is the API running on port 5000?";
      }
      return `Request failed (HTTP ${status ?? '?'}).`;
    }
    return 'Something went wrong.';
  }
}
