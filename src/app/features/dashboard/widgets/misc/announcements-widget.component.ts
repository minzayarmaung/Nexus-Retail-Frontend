import { Component, Input } from '@angular/core';
import type { AnnouncementItem } from '../../../../core/dashboard/dashboard.models';

@Component({
  selector: 'app-announcements-widget',
  template: `
    <ul class="h-full space-y-3 overflow-auto">
      @for (note of items; track note.id) {
        <li class="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-950/30">
          <div class="flex items-start justify-between gap-2">
            <p class="font-medium text-slate-900 dark:text-slate-100">{{ note.title }}</p>
            <span class="shrink-0 text-xs text-slate-500 dark:text-slate-400">{{ note.postedAt }}</span>
          </div>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">{{ note.message }}</p>
        </li>
      }
    </ul>
  `
})
export class AnnouncementsWidgetComponent {
  @Input() items: AnnouncementItem[] = [];
}

