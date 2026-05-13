import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoFormComponent } from './todo-form.component';

describe('TodoFormComponent', () => {
  let fixture: ComponentFixture<TodoFormComponent>;
  let component: TodoFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
  }

  function submitForm(value: string) {
    const input = getInput();
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('renders an input and a submit button', () => {
    expect(getInput()).toBeTruthy();
    expect(fixture.nativeElement.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('emits add with the trimmed title and clears the input on submit', () => {
    let emitted: string | undefined;
    component.add.subscribe((value: string) => (emitted = value));

    submitForm('  buy milk  ');

    expect(emitted).toBe('buy milk');
    expect(getInput().value).toBe('');
  });

  it('does not emit when the title is empty or whitespace only', () => {
    let emitted = false;
    component.add.subscribe(() => (emitted = true));

    submitForm('   ');

    expect(emitted).toBe(false);
  });
});
