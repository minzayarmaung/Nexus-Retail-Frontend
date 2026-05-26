import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { formatRoleLabel } from '../../features/users/role-display.util';

export interface RoleSelectOption {
  name: string;
  label?: string;
}

@Component({
  selector: 'app-roles-multi-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative" [class.z-30]="open()">
      <button
        type="button"
        class="flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2.5 text-left text-sm transition outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:bg-slate-950/40 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-white/10"
        [class.border-slate-200]="!open()"
        [class.dark:border-slate-700]="!open()"
        [class.border-slate-400]="open()"
        [class.ring-2]="open()"
        [class.ring-slate-900/10]="open()"
        [disabled]="disabled()"
        (click)="toggle()"
        [attr.aria-expanded]="open()"
        aria-haspopup="listbox"
      >
        <span class="min-w-0 flex-1 truncate" [class.text-slate-400]="!summary()">
          {{ summary() || placeholder() }}
        </span>
        <svg
          class="size-4 shrink-0 text-slate-500 transition dark:text-slate-400"
          [class.rotate-180]="open()"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full pt-1"
        aria-hidden="true"
      >
        <p class="px-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          {{ label() }}
          @if (required()) {
            <span class="text-rose-500">*</span>
          }
        </p>
      </div>

      @if (open()) {
        <div
          class="absolute inset-x-0 bottom-full z-40 mb-8 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-900"
          role="listbox"
          aria-multiselectable="true"
        >
          @if (loading()) {
            <p class="px-3 py-2 text-xs text-slate-500">Loading roles…</p>
          } @else if (!options().length) {
            <p class="px-3 py-2 text-xs text-slate-500">No roles available.</p>
          } @else {
            @for (opt of options(); track opt.name; let i = $index) {
              <button
                type="button"
                role="option"
                class="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-slate-800 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800/80"
                [class.bg-slate-50]="i % 2 === 0"
                [class.dark:bg-slate-950/50]="i % 2 === 0"
                [attr.aria-selected]="isSelected(opt.name)"
                (click)="toggleOption(opt.name, $event)"
              >
                <span
                  class="flex size-4 shrink-0 items-center justify-center rounded border"
                  [class.border-slate-900]="isSelected(opt.name)"
                  [class.bg-slate-900]="isSelected(opt.name)"
                  [class.border-slate-300]="!isSelected(opt.name)"
                  [class.dark:border-slate-500]="!isSelected(opt.name)"
                >
                  @if (isSelected(opt.name)) {
                    <svg class="size-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  }
                </span>
                <span>{{ opt.label ?? formatRole(opt.name) }}</span>
              </button>
            }
          }
        </div>
      }
    </div>
  `,
})
export class RolesMultiSelectComponent {
  private readonly el = inject(ElementRef<HTMLElement>);

  readonly label = input('Roles');
  readonly placeholder = input('Select roles…');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly options = input<RoleSelectOption[]>([]);
  readonly selected = input<string[]>([]);
  readonly selectedChange = output<string[]>();

  readonly open = signal(false);
  readonly formatRole = formatRoleLabel;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }

  summary(): string {
    const names = this.selected();
    if (!names.length) return '';
    return names.map((n) => formatRoleLabel(n)).join(', ');
  }

  isSelected(name: string): boolean {
    return this.selected().includes(name);
  }

  toggle(): void {
    if (this.disabled()) return;
    this.open.update((v) => !v);
  }

  toggleOption(name: string, event: MouseEvent): void {
    event.stopPropagation();
    const cur = this.selected();
    const next = cur.includes(name) ? cur.filter((r) => r !== name) : [...cur, name];
    this.selectedChange.emit(next);
  }
}
