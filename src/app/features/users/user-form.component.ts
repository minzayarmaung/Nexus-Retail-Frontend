import { ChangeDetectorRef, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, firstValueFrom, takeUntil } from 'rxjs';
import { PasswordInputComponent } from '../../shared/form/password-input.component';
import { RolesMultiSelectComponent } from '../../shared/form/roles-multi-select.component';
import { RolesApiService } from '../../configuration/roles/roles.api';
import type { RoleApiDto } from '../../configuration/roles/roles.model';
import { ToastService } from '../../core/toast/toast.service';
import { formatRoleLabel } from './role-display.util';
import { assessPasswordStrength } from './password-strength.util';
import { suggestUsernames } from './username.util';
import { blankUserForm, type UserFormModel, type UserListItem } from './users.model';
import { UsersService } from './users.service';

@Component({
  selector: 'app-user-form',
  imports: [FormsModule, PasswordInputComponent, RolesMultiSelectComponent],
  template: `
    <div class="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {{ isEdit() ? 'Edit user' : 'Create user' }}
        </h1>
        <p class="mt-2 text-[15px] text-slate-600 dark:text-slate-400">
          {{ isEdit() ? 'Update account details and roles.' : 'Add a new user to the platform.' }}
        </p>
      </div>

      @if (loadingUser()) {
        <p class="py-12 text-center text-sm text-slate-600 dark:text-slate-400">Loading…</p>
      } @else {
        <form class="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900" (ngSubmit)="save()">
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >Username <span class="text-rose-500">*</span></label
            >
            <input
              class="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-slate-900/10 dark:bg-slate-950/40 dark:text-slate-100"
              [class.border-rose-400]="usernameTaken()"
              [class.border-slate-200]="!usernameTaken()"
              [class.dark:border-slate-700]="!usernameTaken()"
              [(ngModel)]="form.username"
              (ngModelChange)="onUsernameInput($event)"
              name="username"
              required
              autocomplete="off"
            />
            @if (checkingUsername()) {
              <p class="text-xs text-slate-500">Checking availability…</p>
            }
            @if (usernameTaken()) {
              <p class="text-xs text-rose-600 dark:text-rose-400">This username is already taken.</p>
              @if (usernameSuggestions().length) {
                <p class="text-xs text-slate-600 dark:text-slate-400">Try:</p>
                <div class="flex flex-wrap gap-2">
                  @for (s of usernameSuggestions(); track s) {
                    <button
                      type="button"
                      class="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-800 hover:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                      (click)="applySuggestion(s)"
                    >
                      {{ s }}
                    </button>
                  }
                </div>
              }
            }
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >Email <span class="text-rose-500">*</span></label
            >
            <input
              type="email"
              class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
              [(ngModel)]="form.email"
              name="email"
              required
            />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >First Name <span class="text-rose-500">*</span></label
              >
              <input
                class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                [(ngModel)]="form.firstName"
                name="firstName"
                required
              />
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >Last Name <span class="text-rose-500">*</span></label
              >
              <input
                class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                [(ngModel)]="form.lastName"
                name="lastName"
                required
              />
            </div>
          </div>

          <div class="flex flex-col gap-3">
            @if (!isEdit()) {
              <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" [(ngModel)]="form.generatePassword" name="generatePassword" (ngModelChange)="onGeneratePasswordChange($event)" />
                Generate password
              </label>
            }
            <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input type="checkbox" [(ngModel)]="form.cannotChangePassword" name="cannotChangePassword" />
              Cannot change password
            </label>
          </div>

          @if (!form.generatePassword && !isEdit()) {
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >Password <span class="text-rose-500">*</span></label
              >
              <app-password-input
                name="password"
                [(ngModel)]="form.password"
                autocomplete="new-password"
              />
              @if (form.password) {
                <ul class="space-y-0.5 text-xs text-slate-500">
                  @for (c of passwordStrength().checks; track c.label) {
                    <li [class.text-emerald-600]="c.met">{{ c.met ? '✓' : '○' }} {{ c.label }}</li>
                  }
                </ul>
              }
            </div>
          }

          <div class="pb-6">
            <app-roles-multi-select
              label="Roles"
              [required]="true"
              [loading]="rolesLoading()"
              [options]="roleOptions()"
              [selected]="form.roles"
              (selectedChange)="onRolesChange($event)"
            />
          </div>

          <div class="flex justify-center gap-3 pt-4">
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200"
              (click)="cancel()"
              [disabled]="saving()"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900"
              [disabled]="!canSave() || saving()"
            >
              {{ saving() ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </form>
      }
    </div>

    @if (generatedPasswordNotiOpen()) {
      <div class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 p-4" role="dialog" aria-modal="true">
        <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">User created</h2>
          <p class="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            The generated password has been sent to
            <span class="font-medium text-slate-900 dark:text-slate-100">{{ generatedPasswordNotiEmail() }}</span>.
            Please use it to log in and do not share it with others.
          </p>
          <div class="mt-6 flex justify-end">
            <button
              type="button"
              class="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              (click)="closeGeneratedPasswordNoti()"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class UserFormComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  private readonly rolesApi = inject(RolesApiService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly destroy$ = new Subject<void>();
  private readonly usernameCheck$ = new Subject<string>();
  private originalUsername = '';

  form: UserFormModel = blankUserForm();
  readonly isEdit = signal(false);
  readonly userId = signal<string | null>(null);
  readonly loadingUser = signal(false);
  readonly saving = signal(false);
  readonly checkingUsername = signal(false);
  readonly usernameTaken = signal(false);
  readonly usernameSuggestions = signal<string[]>([]);
  readonly availableRoles = signal<RoleApiDto[]>([]);
  readonly rolesLoading = signal(true);
  readonly generatedPasswordNotiOpen = signal(false);
  readonly generatedPasswordNotiEmail = signal('');

  readonly roleOptions = computed(() =>
    this.availableRoles().map((r) => ({
      name: r.name,
      label: formatRoleLabel(r.name),
    })),
  );

  readonly passwordStrength = () => assessPasswordStrength(this.form.password);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit.set(!!id);
    if (id) {
      this.userId.set(id);
      void this.loadUser(id);
    }
    void this.loadRoles();

    this.usernameCheck$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((username) => void this.checkUsernameAvailability(username));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onUsernameInput(value: string): void {
    this.form.username = value;
    this.usernameTaken.set(false);
    this.usernameSuggestions.set([]);
    const trimmed = value.trim();
    if (trimmed.length >= 2) {
      this.usernameCheck$.next(trimmed);
    }
  }

  applySuggestion(s: string): void {
    this.form.username = s;
    this.usernameTaken.set(false);
    this.usernameSuggestions.set([]);
    this.usernameCheck$.next(s);
  }

  async onGeneratePasswordChange(checked: boolean): Promise<void> {
    if (checked && this.form.username.trim()) {
      try {
        this.form.password = await this.usersService.generatePassword(this.form.username);
      } catch {
        /* optional */
      }
    } else if (!checked) {
      this.form.password = '';
    }
  }

  onRolesChange(roles: string[]): void {
    this.form.roles = roles;
  }

  private async loadRoles(): Promise<void> {
    this.rolesLoading.set(true);
    try {
      const roles = await firstValueFrom(this.rolesApi.getRoles());
      this.availableRoles.set(roles.filter((r) => !r.is_disabled));
    } catch {
      this.toast.error('Failed to load roles');
    } finally {
      this.rolesLoading.set(false);
    }
  }

  private async loadUser(id: string): Promise<void> {
    this.loadingUser.set(true);
    try {
      const u = await this.usersService.loadUserDetail(id);
      this.patchForm(u);
      this.originalUsername = u.username;
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Failed to load user');
      void this.router.navigate(['/dashboard', 'users']);
    } finally {
      this.loadingUser.set(false);
    }
  }

  private patchForm(u: UserListItem): void {
    this.form = {
      username: u.username,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      password: '',
      generatePassword: u.generatePassword ?? false,
      cannotChangePassword: u.cannotChangePassword ?? false,
      roles: [...u.roles],
    };
  }

  private async checkUsernameAvailability(username: string): Promise<void> {
    if (this.isEdit() && username === this.originalUsername) {
      this.usernameTaken.set(false);
      return;
    }
    this.checkingUsername.set(true);
    try {
      const taken = await this.usersService.checkUsernameTaken(username);
      this.usernameTaken.set(taken);
      this.usernameSuggestions.set(taken ? suggestUsernames(username) : []);
    } catch {
      this.usernameTaken.set(false);
    } finally {
      this.checkingUsername.set(false);
    }
  }

  canSave(): boolean {
    const f = this.form;
    if (
      !f.username.trim() ||
      !f.email.trim() ||
      !f.firstName.trim() ||
      !f.lastName.trim() ||
      !f.roles.length
    ) {
      return false;
    }
    if (this.usernameTaken()) return false;
    if (!this.isEdit() && !f.generatePassword) {
      return assessPasswordStrength(f.password).valid;
    }
    return true;
  }

  cancel(): void {
    const id = this.userId();
    if (this.isEdit() && id) {
      void this.router.navigate(['/dashboard', 'users', id]);
    } else {
      void this.router.navigate(['/dashboard', 'users']);
    }
  }

  async closeGeneratedPasswordNoti(): Promise<void> {
    this.generatedPasswordNotiOpen.set(false);
    this.generatedPasswordNotiEmail.set('');
    await this.usersService.loadUsers();
    void this.router.navigate(['/dashboard', 'users']);
  }

  async save(): Promise<void> {
    if (!this.canSave() || this.saving()) return;
    this.saving.set(true);
    const f = this.form;
    try {
      if (this.isEdit()) {
        const id = this.userId();
        if (!id) throw new Error('Invalid user');
        await this.usersService.updateUser(id, {
          username: f.username.trim(),
          email: f.email.trim(),
          firstName: f.firstName.trim(),
          lastName: f.lastName.trim(),
          cannotChangePassword: f.cannotChangePassword,
          roles: f.roles,
        });
        this.toast.success('User updated');
        void this.router.navigate(['/dashboard', 'users', id]);
      } else {
        const email = f.email.trim();
        const usedGeneratePassword = f.generatePassword;
        await this.usersService.createUser(
          {
            username: f.username.trim(),
            email,
            firstName: f.firstName.trim(),
            lastName: f.lastName.trim(),
            generatePassword: usedGeneratePassword,
            cannotChangePassword: f.cannotChangePassword,
            password: usedGeneratePassword ? undefined : f.password,
            roles: f.roles,
          },
          { refreshList: !usedGeneratePassword },
        );
        if (usedGeneratePassword) {
          this.generatedPasswordNotiEmail.set(email);
          this.generatedPasswordNotiOpen.set(true);
          this.cdr.markForCheck();
        } else {
          this.toast.success('User created');
          void this.router.navigate(['/dashboard', 'users']);
        }
      }
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      this.saving.set(false);
    }
  }
}
