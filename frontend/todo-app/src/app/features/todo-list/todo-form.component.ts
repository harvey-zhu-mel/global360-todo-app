import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  signal,
} from '@angular/core';

/**
 * The "What needs to be done?" input row.
 * Pure presentation — it only emits a string; persistence lives in the parent.
 */
@Component({
  selector: 'app-todo-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (submit)="onSubmit($event)" novalidate>
      <input
        type="text"
        [value]="title()"
        (input)="onInput($any($event.target).value)"
        placeholder="What needs to be done?"
        aria-label="New todo title"
        maxlength="500"
      />
      <button type="submit">Add</button>
    </form>
  `,
  styleUrl: './todo-form.component.css',
})
export class TodoFormComponent {
  @Output() readonly add = new EventEmitter<string>();

  protected readonly title = signal('');

  onInput(value: string): void {
    this.title.set(value);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const trimmed = this.title().trim();
    if (trimmed.length === 0) {
      return;
    }
    this.add.emit(trimmed);
    this.title.set('');
  }
}
