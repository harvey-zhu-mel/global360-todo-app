import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { Todo } from '../../core/models/todo.model';

/**
 * A single TODO row. Receives a {@link Todo} input and emits a `delete`
 * event carrying the id when the trash button is pressed.
 */
@Component({
  selector: 'app-todo-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <span class="title">{{ todo.title }}</span>
    <time [attr.datetime]="todo.createdAt">{{ todo.createdAt | date: 'short' }}</time>
    <button
      type="button"
      class="delete"
      [attr.aria-label]="'Delete ' + todo.title"
      (click)="delete.emit(todo.id)"
    >
      ✕
    </button>
  `,
  styleUrl: './todo-item.component.css',
})
export class TodoItemComponent {
  @Input({ required: true }) todo!: Todo;
  @Output() readonly delete = new EventEmitter<string>();
}
