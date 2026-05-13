import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Todo } from '../models/todo.model';
import { API_BASE_URL } from '../tokens/api-base-url.token';

/**
 * Thin wrapper over the /api/todos endpoints.
 *
 * Kept stateless on purpose — UI state (the in-memory list, loading flags,
 * error banner) belongs in the list component, not in the service.
 */
@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  private get endpoint(): string {
    return `${this.baseUrl}/api/todos`;
  }

  /** Fetches the full list of todos, in insertion order. */
  list(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.endpoint);
  }

  /** Creates a new todo from a title and returns the server-assigned record. */
  add(title: string): Observable<Todo> {
    return this.http.post<Todo>(this.endpoint, { title });
  }

  /** Deletes the todo with the given id. Emits and completes on success. */
  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
