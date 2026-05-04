import { Component, inject } from '@angular/core';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button
      type="button"
      class="inline-flex h-[42px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      (click)="theme.toggle()"
      [attr.aria-pressed]="theme.mode() === 'dark'"
    >
      <span class="text-xs font-semibold uppercase tracking-wide opacity-80">
        {{ theme.mode() === 'dark' ? 'Dark' : 'Light' }}
      </span>
      <span
        class="relative inline-flex h-5 w-10 items-center rounded-full bg-slate-200 transition dark:bg-slate-700"
        aria-hidden="true"
      >
        <span
          class="inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow transition"
          [class.translate-x-5]="theme.mode() === 'dark'"
        ></span>
      </span>
    </button>
  `
})
export class ThemeToggleComponent {
  readonly theme = inject(ThemeService);
}

