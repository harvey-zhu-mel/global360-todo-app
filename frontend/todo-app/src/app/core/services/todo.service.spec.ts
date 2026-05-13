import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { TodoService } from './todo.service';
import { Todo } from '../models/todo.model';
import { API_BASE_URL } from '../tokens/api-base-url.token';

describe('TodoService', () => {
  let service: TodoService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:5000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    });
    service = TestBed.inject(TodoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('list()', () => {
    it('issues GET /api/todos and emits the parsed array', () => {
      const fake: Todo[] = [
        { id: '11111111-1111-1111-1111-111111111111', title: 'a', createdAt: '2026-05-13T00:00:00Z' },
      ];

      let received: Todo[] | undefined;
      service.list().subscribe((items) => (received = items));

      const req = httpMock.expectOne(`${baseUrl}/api/todos`);
      expect(req.request.method).toBe('GET');
      req.flush(fake);

      expect(received).toEqual(fake);
    });
  });

  describe('add()', () => {
    it('issues POST /api/todos with { title } and emits the created Todo', () => {
      const created: Todo = {
        id: '22222222-2222-2222-2222-222222222222',
        title: 'buy milk',
        createdAt: '2026-05-13T00:00:01Z',
      };

      let received: Todo | undefined;
      service.add('buy milk').subscribe((t) => (received = t));

      const req = httpMock.expectOne(`${baseUrl}/api/todos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ title: 'buy milk' });
      req.flush(created);

      expect(received).toEqual(created);
    });
  });

  describe('remove()', () => {
    it('issues DELETE /api/todos/{id} and completes', () => {
      const id = '33333333-3333-3333-3333-333333333333';
      let completed = false;

      service.remove(id).subscribe({ complete: () => (completed = true) });

      const req = httpMock.expectOne(`${baseUrl}/api/todos/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });

      expect(completed).toBe(true);
    });
  });
});
