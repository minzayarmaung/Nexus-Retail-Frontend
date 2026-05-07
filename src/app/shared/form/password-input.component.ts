import { CommonModule } from '@angular/common';
import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative w-full">
      <input
        [attr.name]="name()"
        [attr.placeholder]="placeholder()"
        [attr.autocomplete]="autocomplete()"
        [disabled]="disabled"
        [type]="show ? 'text' : 'password'"
        [(ngModel)]="value"
        (ngModelChange)="handleChange($event)"
        (blur)="handleTouched()"
        [class]="inputClass()" />
      <button
        type="button"
        (click)="show = !show"
        [disabled]="disabled"
        class="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 disabled:opacity-50 dark:text-slate-500 dark:hover:text-slate-300"
        [attr.aria-label]="show ? 'Hide password' : 'Show password'">
        @if (show) {
          <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.88 4.24A10.94 10.94 0 0 1 12 4c7 0 10 8 10 8a16.5 16.5 0 0 1-4.14 5.44" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.61 6.61A16.4 16.4 0 0 0 2 12s3 8 10 8a10.94 10.94 0 0 0 5.76-1.62" />
          </svg>
        } @else {
          <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        }
      </button>
    </div>
  `,
})
export class PasswordInputComponent implements ControlValueAccessor {
  readonly placeholder = input<string>('Password');
  readonly name = input<string>('password');
  readonly autocomplete = input<string>('current-password');
  readonly inputClass = input<string>('w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm pr-10');

  value = '';
  show = false;
  disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  handleChange(value: string): void {
    this.onChange(value);
  }

  handleTouched(): void {
    this.onTouched();
  }
}
