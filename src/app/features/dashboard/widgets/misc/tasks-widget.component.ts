import { Component, Input } from '@angular/core';
import type { TaskItem } from '../../../../core/dashboard/dashboard.models';

@Component({
  selector: 'app-tasks-widget',
  template: `
    <div class="h-full overflow-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="border-b border-slate-200 dark:border-slate-700">
            <th class="px-2 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Task</th>
            <th class="px-2 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Owner</th>
            <th class="px-2 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Due</th>
            <th class="px-2 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Status</th>
          </tr>
        </thead>
        <tbody>
          @for (t of items; track t.id) {
            <tr class="border-b border-slate-100 dark:border-slate-800">
              <td class="px-2 py-2 text-slate-800 dark:text-slate-100">{{ t.title }}</td>
              <td class="px-2 py-2 text-slate-600 dark:text-slate-300">{{ t.owner }}</td>
              <td class="px-2 py-2 text-slate-600 dark:text-slate-300">{{ t.dueAt }}</td>
              <td class="px-2 py-2">
                <span class="rounded-full px-2 py-0.5 text-xs font-semibold"
                  [class.bg-amber-100]="t.status === 'pending'"
                  [class.text-amber-700]="t.status === 'pending'"
                  [class.dark:bg-amber-900/40]="t.status === 'pending'"
                  [class.dark:text-amber-200]="t.status === 'pending'"
                  [class.bg-sky-100]="t.status === 'in_progress'"
                  [class.text-sky-700]="t.status === 'in_progress'"
                  [class.dark:bg-sky-900/40]="t.status === 'in_progress'"
                  [class.dark:text-sky-200]="t.status === 'in_progress'"
                  [class.bg-rose-100]="t.status === 'blocked'"
                  [class.text-rose-700]="t.status === 'blocked'"
                  [class.dark:bg-rose-900/40]="t.status === 'blocked'"
                  [class.dark:text-rose-200]="t.status === 'blocked'"
                >
                  {{ t.status }}
                </span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class TasksWidgetComponent {
  @Input() items: TaskItem[] = [];
}

