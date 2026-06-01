import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../i18n/translate.pipe';
import type { NavIcon } from '../../core/navigation/nav.config';
import { NavIconComponent } from './nav-icon.component';

export interface NavHubCard {
  path: string[];
  labelKey?: string;
  plainLabel?: string;
  descriptionKey?: string;
  icon: NavIcon;
}

@Component({
  selector: 'app-nav-hub',
  imports: [RouterLink, NavIconComponent, TranslatePipe],
  template: `
    <div class="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{{ title() }}</h1>
        @if (subtitleKey()) {
          <p class="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            {{ subtitleKey()! | translate }}
          </p>
        }
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        @for (item of items(); track item.path.join('/')) {
          <a
            [routerLink]="linkFor(item.path)"
            class="group flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-900/90"
          >
            <span
              class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:group-hover:bg-slate-100 dark:group-hover:text-slate-900"
            >
              <app-nav-icon [icon]="item.icon" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-base font-semibold text-slate-900 dark:text-slate-100">
                @if (item.plainLabel) {
                  {{ item.plainLabel }}
                } @else if (item.labelKey) {
                  {{ item.labelKey | translate }}
                }
              </span>
              @if (item.descriptionKey) {
                <span class="mt-1 block text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {{ item.descriptionKey | translate }}
                </span>
              }
            </span>
            <svg
              class="size-5 shrink-0 self-center text-slate-400 transition group-hover:text-slate-700 dark:group-hover:text-slate-200"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clip-rule="evenodd"
              />
            </svg>
          </a>
        }
      </div>
    </div>
  `,
})
export class NavHubComponent {
  readonly title = input.required<string>();
  readonly subtitleKey = input<string | null>(null);
  readonly items = input.required<NavHubCard[]>();

  linkFor(path: string[]): string[] {
    if (path.length === 0) return ['/dashboard'];
    return ['/dashboard', ...path];
  }
}
