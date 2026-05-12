import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dashboard-widget-shell',
  template: `
    <section
      class="h-full rounded-xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/5 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none"
    >
      <header class="flex items-start justify-between gap-3 border-b border-slate-200/70 px-4 py-3 dark:border-slate-700/60">
        <div class="min-w-0">
          <h3 class="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {{ title }}
          </h3>
          @if (subtitle) {
            <p class="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
              {{ subtitle }}
            </p>
          }
        </div>

        <div class="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            class="gridstack-drag-handle rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
            [disabled]="!customizing"
            [class.opacity-50]="!customizing"
            [class.cursor-default]="!customizing"
            aria-label="Move widget"
            title="Move"
          >
            Move
          </button>
          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
            [disabled]="!customizing"
            [class.opacity-50]="!customizing"
            [class.cursor-default]="!customizing"
            (click)="hide.emit()"
          >
            Hide
          </button>
        </div>
      </header>

      <div class="h-[calc(100%-3.25rem)] p-4">
        <ng-content />
      </div>
    </section>
  `
})
export class DashboardWidgetShellComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle?: string;
  @Input() customizing = false;

  @Output() hide = new EventEmitter<void>();
}

