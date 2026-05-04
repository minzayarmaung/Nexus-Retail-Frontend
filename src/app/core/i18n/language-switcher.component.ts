import { Component, inject, input } from '@angular/core';
import { TranslatePipe } from './translate.pipe';
import { TranslateService, type AppLanguage } from './translate.service';

const selectBase =
  'w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white font-medium text-slate-800 shadow-sm outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10';

@Component({
  selector: 'app-language-switcher',
  imports: [TranslatePipe],
  template: `
    <div class="relative inline-block w-full max-w-[220px]" [class.max-w-none]="!compact()">
      @if (!compact()) {
        <label
          [attr.for]="selectId()"
          class="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
        >
          {{ 'common.language' | translate }}
        </label>
      }
      <div class="relative">
        <select
          [id]="selectId()"
          [class]="selectClasses()"
          [value]="tr.language()"
          (change)="onSelect($event)"
          [attr.aria-label]="compact() ? ('common.language' | translate) : null"
        >
          <option value="en">{{ 'common.english' | translate }}</option>
          <option value="my">{{ 'common.burmese' | translate }}</option>
        </select>
        <span
          class="pointer-events-none absolute inset-y-0 right-0 flex w-9 items-center justify-center text-slate-500"
          aria-hidden="true"
        >
          <svg class="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
      </div>
    </div>
  `
})
export class LanguageSwitcherComponent {
  protected readonly tr = inject(TranslateService);
  readonly compact = input(false);

  protected selectId(): string {
    return this.compact() ? 'language-select-compact' : 'language-select-full';
  }

  protected selectClasses(): string {
    return this.compact()
      ? `${selectBase} py-1.5 pl-2.5 pr-9 text-xs`
      : `${selectBase} py-2.5 pl-3.5 pr-10 text-sm`;
  }

  protected onSelect(ev: Event): void {
    const el = ev.target as HTMLSelectElement;
    const v = el.value as AppLanguage;
    if (v === 'en' || v === 'my') {
      void this.tr.loadLanguage(v);
    }
  }
}
