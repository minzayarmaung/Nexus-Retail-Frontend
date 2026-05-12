import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dashboard-customize-bar',
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 dark:border-slate-700/60 dark:bg-slate-900">
      <p class="text-sm text-slate-600 dark:text-slate-300">
        Drag and resize widgets to prioritize your dashboard.
      </p>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
          (click)="reset.emit()"
        >
          Reset Layout
        </button>
        <button
          type="button"
          class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          (click)="toggleCustomize.emit()"
        >
          {{ customizing ? 'Finish Customizing' : 'Customize Dashboard' }}
        </button>
      </div>
    </div>
  `
})
export class DashboardCustomizeBarComponent {
  @Input() customizing = false;

  @Output() reset = new EventEmitter<void>();
  @Output() toggleCustomize = new EventEmitter<void>();
}

