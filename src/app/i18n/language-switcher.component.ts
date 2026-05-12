import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  signal
} from '@angular/core';
import { TranslatePipe } from './translate.pipe';
import { TranslateService, type AppLanguage } from './translate.service';

const FLAG: Record<AppLanguage, { src: string; labelKey: string }> = {
  en: { src: '/flags/gb.svg', labelKey: 'common.english' },
  my: { src: '/flags/mm.svg', labelKey: 'common.burmese' }
};

const triggerBase =
  'flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white text-left font-medium text-slate-800 shadow-sm outline-none transition hover:border-slate-300 focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900/10';

@Component({
  selector: 'app-language-switcher',
  imports: [TranslatePipe],
  template: `
    <div class="relative inline-block w-full max-w-[220px]" [class.max-w-none]="!compact()">
      @if (!compact()) {
        <label
          [attr.for]="triggerId()"
          [id]="labelId()"
          class="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
        >
          {{ 'common.language' | translate }}
        </label>
      }
      <div class="relative">
        <button
          type="button"
          [id]="triggerId()"
          [class]="triggerClasses()"
          [attr.aria-expanded]="open()"
          aria-haspopup="listbox"
          [attr.aria-label]="compact() ? ('common.language' | translate) : null"
          [attr.aria-controls]="open() ? listboxId() : null"
          (click)="toggle($event)"
        >
          <img
            [src]="flagSrc(tr.language())"
            alt=""
            width="28"
            height="18"
            decoding="async"
            class="h-[18px] w-7 shrink-0 rounded-sm border border-slate-200/80 object-cover shadow-sm"
          />
          @if (compact()) {
            <span class="min-w-0 flex-1 truncate text-xs font-semibold uppercase">{{
              tr.language()
            }}</span>
          } @else {
            <span class="min-w-0 flex-1 truncate text-sm">{{
              FLAG[tr.language()].labelKey | translate
            }}</span>
          }
          <svg
            class="size-4 shrink-0 text-slate-500 transition"
            [class.rotate-180]="open()"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        @if (open()) {
          <div
            [id]="listboxId()"
            role="listbox"
            [attr.aria-labelledby]="compact() ? triggerId() : labelId()"
            class="absolute right-0 z-[110] mt-1 min-w-full overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5"
          >
            @for (lang of languages; track lang) {
              <button
                type="button"
                role="option"
                [attr.aria-selected]="tr.language() === lang"
                class="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-slate-800 transition hover:bg-slate-50"
                [class.bg-slate-50]="tr.language() === lang"
                (click)="pick(lang, $event)"
              >
                <img
                  [src]="flagSrc(lang)"
                  alt=""
                  width="28"
                  height="18"
                  decoding="async"
                  class="h-[18px] w-7 shrink-0 rounded-sm border border-slate-200/80 object-cover shadow-sm"
                />
                <span class="font-medium">{{ FLAG[lang].labelKey | translate }}</span>
              </button>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class LanguageSwitcherComponent {
  protected readonly tr = inject(TranslateService);
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly compact = input(false);

  protected readonly open = signal(false);
  protected readonly FLAG = FLAG;
  protected readonly languages: AppLanguage[] = ['en', 'my'];

  protected triggerId(): string {
    return this.compact() ? 'lang-trigger-compact' : 'lang-trigger-full';
  }

  protected labelId(): string {
    return 'lang-label-full';
  }

  protected listboxId(): string {
    return this.compact() ? 'lang-listbox-compact' : 'lang-listbox-full';
  }

  protected triggerClasses(): string {
    return this.compact()
      ? `${triggerBase} px-2 py-1.5`
      : `${triggerBase} px-3 py-2.5`;
  }

  protected flagSrc(lang: AppLanguage): string {
    return FLAG[lang].src;
  }

  protected toggle(ev: MouseEvent): void {
    ev.stopPropagation();
    this.open.update((v) => !v);
  }

  protected pick(lang: AppLanguage, ev: MouseEvent): void {
    ev.stopPropagation();
    void this.tr.loadLanguage(lang);
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(ev: MouseEvent): void {
    if (!this.open()) {
      return;
    }
    const t = ev.target as Node | null;
    if (t && this.host.nativeElement.contains(t)) {
      return;
    }
    this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) {
      this.open.set(false);
    }
  }
}
