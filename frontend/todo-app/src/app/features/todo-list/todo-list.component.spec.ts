import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { TodoListComponent } from './todo-list.component';
import { API_BASE_URL } from '../../core/tokens/api-base-url.token';
import { Todo } from '../../core/models/todo.model';

describe('TodoListComponent', () => {
  let fixture: ComponentFixture<TodoListComponent>;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:5000';

  const todos: Todo[] = [
    { id: 'a', title: 'first', createdAt: '2026-05-13T12:00:00Z' },
    { id: 'b', title: 'second', createdAt: '2026-05-13T12:01:00Z' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoListComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches the todo list on init and renders one row per item', async () => {
    fixture.detectChanges(); // triggers ngOnInit -> service.list()

    httpMock.expectOne(`${baseUrl}/api/todos`).flush(todos);
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="todo-row"]');
    expect(rows.length).toBe(2);

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('first');
    expect(text).toContain('second');
  });

  it('renders an empty-state message when the list is empty', async () => {
    fixture.detectChanges();
    httpMock.expectOne(`${baseUrl}/api/todos`).flush([]);
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No tasks yet');
  });

  it('posts to the API and appends the new todo so the on-add order matches the server insertion order', async () => {
    // Start from a non-empty list so we can verify position, not just count.
    fixture.detectChanges();
    httpMock.expectOne(`${baseUrl}/api/todos`).flush(todos);
    await fixture.whenStable();
    fixture.detectChanges();

    // Submit the form with a new title.
    const input = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'new task';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const post = httpMock.expectOne(`${baseUrl}/api/todos`);
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({ title: 'new task' });
    post.flush({ id: 'new', title: 'new task', createdAt: '2026-05-13T12:02:00Z' });

    await fixture.whenStable();
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('[data-testid="todo-row"]');
    expect(rows.length).toBe(3);
    // The new row must be appended at the bottom — matching the server's
    // insertion order returned by GET /api/todos.
    expect((rows[0] as HTMLElement).textContent).toContain('first');
    expect((rows[1] as HTMLElement).textContent).toContain('second');
    expect((rows[2] as HTMLElement).textContent).toContain('new task');
  });

  it('deletes via the API and removes the row on delete', async () => {
    fixture.detectChanges();
    httpMock.expectOne(`${baseUrl}/api/todos`).flush(todos);
    await fixture.whenStable();
    fixture.detectChanges();

    const firstDelete = fixture.nativeElement.querySelector(
      '[data-testid="todo-row"] button[aria-label^="Delete"]',
    ) as HTMLButtonElement;
    firstDelete.click();
    fixture.detectChanges();

    const del = httpMock.expectOne(`${baseUrl}/api/todos/a`);
    expect(del.request.method).toBe('DELETE');
    del.flush(null, { status: 204, statusText: 'No Content' });

    await fixture.whenStable();
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('[data-testid="todo-row"]');
    expect(rows.length).toBe(1);
    expect((rows[0] as HTMLElement).textContent).toContain('second');
  });
});
