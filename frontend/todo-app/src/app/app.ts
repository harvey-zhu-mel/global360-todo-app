import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TodoListComponent } from './features/todo-list/todo-list.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TodoListComponent],
  template: '<app-todo-list />',
})
export class App {}
