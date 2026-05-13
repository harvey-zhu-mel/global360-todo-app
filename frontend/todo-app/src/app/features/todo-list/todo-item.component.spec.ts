import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoItemComponent } from './todo-item.component';
import { Todo } from '../../core/models/todo.model';

describe('TodoItemComponent', () => {
  let fixture: ComponentFixture<TodoItemComponent>;
  let component: TodoItemComponent;

  const sample: Todo = {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'buy milk',
    createdAt: '2026-05-13T12:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('todo', sample);
    fixture.detectChanges();
  });

  it('renders the todo title', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('buy milk');
  });

  it('emits delete with the todo id when the delete button is clicked', () => {
    let emittedId: string | undefined;
    component.delete.subscribe((id: string) => (emittedId = id));

    const btn = fixture.nativeElement.querySelector('button[aria-label^="Delete"]') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    btn.click();
    fixture.detectChanges();

    expect(emittedId).toBe(sample.id);
  });
});
