import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/toast/toast.service';
import { formatAuditDate } from './audit-log.model';
import { AuditLogService } from './audit-log.service';

@Component({
  selector: 'app-audit-log-list',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-7xl space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <a
            routerLink="/dashboard/system"
            class="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            ← System
          </a>
          <h1 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Audit Log
          </h1>
          <p class="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Search platform activity with basic or advanced filters.
          </p>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
        <div class="space-y-4">
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-medium uppercase tracking-wide text-slate-500">Action</label>
              <input
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                [(ngModel)]="draft.action"
                name="action"
                placeholder="e.g. USER_LOGIN"
              />
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-medium uppercase tracking-wide text-slate-500">Maker name</label>
              <input
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                [(ngModel)]="draft.makerName"
                name="makerName"
              />
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-medium uppercase tracking-wide text-slate-500">Result</label>
              <input
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                [(ngModel)]="draft.processingResult"
                name="processingResult"
                placeholder="e.g. SUCCESS"
              />
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-medium uppercase tracking-wide text-slate-500">Entity name</label>
              <input
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                [(ngModel)]="draft.entityName"
                name="entityName"
              />
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div class="space-y-1.5">
              <label class="block text-xs font-medium uppercase tracking-wide text-slate-500">From</label>
              <input
                type="datetime-local"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                [(ngModel)]="draft.from"
                name="from"
              />
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-medium uppercase tracking-wide text-slate-500">To</label>
              <input
                type="datetime-local"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                [(ngModel)]="draft.to"
                name="to"
              />
            </div>
            <div class="flex flex-wrap items-end gap-2">
              <button
                type="button"
                class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                (click)="runSearch()"
              >
                Search
              </button>
              <button
                type="button"
                class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200"
                (click)="clearFilters()"
              >
                Clear
              </button>
              <button
                type="button"
                class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300"
                (click)="advancedOpen.set(!advancedOpen())"
              >
                {{ advancedOpen() ? 'Hide' : 'Advanced' }} search
              </button>
            </div>
          </div>

          @if (advancedOpen()) {
            <div
              class="grid gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-950/30 sm:grid-cols-2 lg:grid-cols-3"
            >
              <div class="space-y-1.5">
                <label class="block text-xs font-medium uppercase tracking-wide text-slate-500">Entity ID</label>
                <input
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                  [(ngModel)]="draft.entityId"
                  name="entityId"
                />
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-medium uppercase tracking-wide text-slate-500">Action method</label>
                <input
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                  [(ngModel)]="draft.actionMethod"
                  name="actionMethod"
                />
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-medium uppercase tracking-wide text-slate-500">Browser</label>
                <input
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                  [(ngModel)]="draft.browserName"
                  name="browserName"
                />
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-medium uppercase tracking-wide text-slate-500">Device model</label>
                <input
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                  [(ngModel)]="draft.deviceModel"
                  name="deviceModel"
                />
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-medium uppercase tracking-wide text-slate-500">Operating system</label>
                <input
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                  [(ngModel)]="draft.operatingSystem"
                  name="operatingSystem"
                />
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-medium uppercase tracking-wide text-slate-500">OS version</label>
                <input
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                  [(ngModel)]="draft.operatingSystemVersion"
                  name="operatingSystemVersion"
                />
              </div>
            </div>
          }
        </div>

        @if (auditService.loadState() === 'loading' || auditService.loadState() === 'idle') {
          <p class="mt-8 py-10 text-center text-sm text-slate-600 dark:text-slate-400">Loading audit logs…</p>
        } @else if (auditService.loadState() === 'error') {
          <div
            class="mt-4 rounded-lg border border-red-200 bg-red-50/80 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
          >
            <p class="font-medium">Could not load audit logs</p>
            <p class="mt-1 opacity-90">{{ auditService.loadError() }}</p>
            <button
              type="button"
              class="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold"
              (click)="runSearch()"
            >
              Retry
            </button>
          </div>
        } @else {
          <div class="mt-6 overflow-x-auto">
            <table class="w-full min-w-[2800px] border-collapse text-left text-sm">
              <thead>
                <tr
                  class="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700"
                >
                  <th class="py-3 pr-4">ID</th>
                  <th class="py-3 pr-4">Date / Time</th>
                  <th class="py-3 pr-4">Action Name</th>
                  <th class="py-3 pr-4">Method</th>
                  <th class="py-3 pr-4">API URL</th>
                  <th class="py-3 pr-4">Entity Name</th>
                  <th class="py-3 pr-4">Entity ID</th>
                  <th class="py-3 pr-4">Maker Name</th>
                  <th class="py-3 pr-4">Maker ID</th>
                  <th class="py-3 pr-4">Result</th>
                  <th class="py-3 pr-4">Error</th>
                  <th class="py-3 pr-4">IP Address</th>
                  <th class="py-3 pr-4">Browser</th>
                  <th class="py-3 pr-4">Device</th>
                  <th class="py-3 pr-4">OS</th>
                  <th class="py-3 pr-4">OS Version</th>
                  <th class="py-3 pr-4">Command (JSON)</th>
                </tr>
              </thead>
              <tbody>
                @for (row of auditService.rows(); track row.id || $index) {
                  <tr class="border-b border-slate-100 dark:border-slate-800">
                    <td class="py-3 pr-4 whitespace-nowrap text-slate-600 dark:text-slate-400">{{ row.id }}</td>
                    <td class="py-3 pr-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {{ formatDate(row.madeOn) }}
                    </td>
                    <td class="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">{{ row.actionName }}</td>
                    <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">{{ row.actionMethod }}</td>
                    <td
                      class="max-w-[14rem] py-3 pr-4 truncate text-slate-600 dark:text-slate-400"
                      [title]="row.apiUrl"
                    >
                      {{ row.apiUrl }}
                    </td>
                    <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">{{ row.entityName }}</td>
                    <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">{{ row.entityId }}</td>
                    <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">{{ row.makerName }}</td>
                    <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">{{ row.makerId }}</td>
                    <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">{{ row.processingResult }}</td>
                    <td
                      class="max-w-[12rem] py-3 pr-4 truncate text-slate-600 dark:text-slate-400"
                      [title]="row.errorMessage"
                    >
                      {{ row.errorMessage }}
                    </td>
                    <td class="py-3 pr-4 whitespace-nowrap text-slate-600 dark:text-slate-400">{{ row.ipAddress }}</td>
                    <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">{{ row.browserName }}</td>
                    <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">{{ row.deviceModel }}</td>
                    <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">{{ row.operatingSystem }}</td>
                    <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">{{ row.operatingSystemVersion }}</td>
                    <td
                      class="max-w-[14rem] py-3 pr-4 truncate font-mono text-xs text-slate-600 dark:text-slate-400"
                      [title]="row.commandAsJson"
                    >
                      {{ row.commandAsJson }}
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="17" class="py-8 text-center text-slate-500 dark:text-slate-400">
                      No audit logs match your filters.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-400">
            <span>
              Page {{ auditService.page() + 1 }} of {{ auditService.totalPages() }} ·
              {{ auditService.totalElements() }} entries
            </span>
            <div class="flex gap-2">
              <button
                type="button"
                class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-50 dark:border-slate-600"
                [disabled]="auditService.page() <= 0"
                (click)="prevPage()"
              >
                Previous
              </button>
              <button
                type="button"
                class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-50 dark:border-slate-600"
                [disabled]="auditService.page() + 1 >= auditService.totalPages()"
                (click)="nextPage()"
              >
                Next
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AuditLogListComponent implements OnInit {
  readonly auditService = inject(AuditLogService);
  private readonly toast = inject(ToastService);

  readonly advancedOpen = signal(false);
  readonly formatDate = formatAuditDate;

  draft = {
    action: '',
    entityName: '',
    entityId: '',
    makerName: '',
    processingResult: '',
    from: '',
    to: '',
    actionMethod: '',
    browserName: '',
    deviceModel: '',
    operatingSystem: '',
    operatingSystemVersion: '',
  };

  ngOnInit(): void {
    void this.runSearch();
  }

  runSearch(): void {
    void this.auditService.search({ ...this.draft }, 0).then(() => {
      if (this.auditService.loadState() === 'error') {
        this.toast.error(this.auditService.loadError() ?? 'Search failed');
      }
    });
  }

  clearFilters(): void {
    this.draft = {
      action: '',
      entityName: '',
      entityId: '',
      makerName: '',
      processingResult: '',
      from: '',
      to: '',
      actionMethod: '',
      browserName: '',
      deviceModel: '',
      operatingSystem: '',
      operatingSystemVersion: '',
    };
    void this.runSearch();
  }

  prevPage(): void {
    void this.auditService.prevPage();
  }

  nextPage(): void {
    void this.auditService.nextPage();
  }
}
