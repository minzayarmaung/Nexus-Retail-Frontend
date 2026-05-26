import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { formatRolesList } from './role-display.util';
import type { UserListItem } from './users.model';
import { UsersService } from './users.service';

@Component({
  selector: 'app-users-list',
  imports: [FormsModule],
  template: `
    <div class="mx-auto max-w-7xl space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Users</h1>
          <p class="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Manage platform users. Click a row to view details.
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          (click)="createUser()"
        >
          Create User
        </button>
      </div>

      <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <input
            class="w-full max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-white/10"
            [ngModel]="keyword()"
            (ngModelChange)="keyword.set($event)"
            name="userSearch"
            placeholder="Search by name, email, or username..."
          />
        </div>

        @if (usersService.loadState() === 'loading' || usersService.loadState() === 'idle') {
          <p class="mt-8 py-10 text-center text-sm text-slate-600 dark:text-slate-400">Loading users…</p>
        } @else if (usersService.loadState() === 'error') {
          <div
            class="mt-4 rounded-lg border border-red-200 bg-red-50/80 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
          >
            <p class="font-medium">Could not load users</p>
            <p class="mt-1 opacity-90">{{ usersService.loadError() }}</p>
            <button
              type="button"
              class="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-900 hover:bg-red-50 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100"
              (click)="reload()"
            >
              Retry
            </button>
          </div>
        } @else {
          <div class="mt-4 overflow-x-auto">
            <table class="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr
                  class="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400"
                >
                  <th class="py-3 pr-4">First Name</th>
                  <th class="py-3 pr-4">Last Name</th>
                  <th class="py-3 pr-4">Email</th>
                  <th class="py-3 pr-4">Roles</th>
                </tr>
              </thead>
              <tbody>
                @for (u of filteredUsers(); track u.id) {
                  <tr
                    class="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                    (click)="openUser(u.id)"
                  >
                    <td class="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">{{ u.firstName || '—' }}</td>
                    <td class="py-3 pr-4 text-slate-800 dark:text-slate-200">{{ u.lastName || '—' }}</td>
                    <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">{{ u.email || '—' }}</td>
                    <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">{{ formatRoles(u.roles) }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="py-8 text-center text-slate-500 dark:text-slate-400">
                      No users match your search.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <p class="mt-4 text-sm text-slate-600 dark:text-slate-400">
            {{ filteredUsers().length }} of {{ usersService.users().length }} users
          </p>
        }
      </div>
    </div>
  `,
})
export class UsersListComponent implements OnInit {
  readonly usersService = inject(UsersService);
  private readonly router = inject(Router);

  readonly keyword = signal('');
  readonly formatRoles = formatRolesList;

  readonly filteredUsers = computed(() => {
    const q = this.keyword().trim().toLowerCase();
    const all = this.usersService.users();
    if (!q) return all;
    return all.filter((u) => this.matchesSearch(u, q));
  });

  ngOnInit(): void {
    void this.reload();
  }

  reload(): Promise<void> {
    return this.usersService.loadUsers();
  }

  private matchesSearch(u: UserListItem, q: string): boolean {
    const haystack = [u.firstName, u.lastName, u.email, u.username, ...u.roles]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  }

  createUser(): void {
    void this.router.navigate(['/dashboard', 'users', 'new']);
  }

  openUser(id: string): void {
    void this.router.navigate(['/dashboard', 'users', id]);
  }
}
