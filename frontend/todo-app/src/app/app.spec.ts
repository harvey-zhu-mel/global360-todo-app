import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { App } from './app';
import { API_BASE_URL } from './core/tokens/api-base-url.token';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://localhost:5000' },
      ],
    }).compileComponents();
  });

  it('renders the TodoList screen', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    // satisfy the initial GET so HttpTestingController doesn't complain
    const httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne('http://localhost:5000/api/todos').flush([]);
    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('My todo list');

    httpMock.verify();
  });
});
