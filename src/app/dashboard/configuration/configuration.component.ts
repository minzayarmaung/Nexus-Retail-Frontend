import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { ToastService } from '../../core/toast/toast.service';
import type {
  CodeDto,
  CodeRequest,
  CodeValueDto,
  CodeValueRequest
} from './configuration.model';
import { ConfigurationApiService } from './configuration.api';

@Component({
  selector: 'app-configuration',
  imports: [FormsModule, TranslatePipe],
  template: `
    <div class="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {{ 'menu.manageCodes' | translate }}
        </h1>
        <p class="mt-2 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
          Mifos-style code management with searchable ordered lists.
        </p>
      </div>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <section class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
          <div class="mb-4 flex items-center justify-between gap-3">
            <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Codes</h2>
            <button
              type="button"
              class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              (click)="startNewCode()"
            >
              New Code
            </button>
          </div>

          <input
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-white/10"
            [(ngModel)]="codeSearchText"
            name="codeSearchText"
            placeholder="Search code name or description..."
          />

          <div class="mt-4 max-h-[56dvh] space-y-2 overflow-y-auto pr-1">
            @for (c of filteredCodes(); track c.id) {
              <button
                type="button"
                class="w-full rounded-lg border px-3 py-3 text-left transition"
                (click)="selectCode(c)"
                [class.border-slate-900]="selectedCodeId() === c.id"
                [class.bg-slate-100]="selectedCodeId() === c.id"
                [class.border-slate-200]="selectedCodeId() !== c.id"
                [class.hover:bg-slate-50]="selectedCodeId() !== c.id"
                [class.dark:border-slate-700]="selectedCodeId() !== c.id"
                [class.dark:hover:bg-slate-800/60]="selectedCodeId() !== c.id"
                [class.dark:bg-slate-800/60]="selectedCodeId() === c.id"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{{ c.codeType }}</p>
                    <p class="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{{ c.description || '—' }}</p>
                  </div>
                  <span class="shrink-0 rounded border border-slate-200 px-2 py-0.5 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-300">{{ c.id }}</span>
                </div>
              </button>
            } @empty {
              <div class="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No code found.
              </div>
            }
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">{{ selectedCode()?.codeType || 'Code Details' }}</h2>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">{{ selectedCode()?.description || 'Select a code from the left list or create a new one.' }}</p>
            </div>
            <button
              type="button"
              class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              (click)="startNewCode()"
            >
              New Code
            </button>
          </div>

          <div class="mt-5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-950/30">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ editingCodeId() ? 'Edit Code' : 'Create Code' }}</h3>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <div class="space-y-1.5">
                <label class="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Code Name</label>
                <input
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-white/10"
                  [(ngModel)]="codeDraft.codeType"
                  name="codeType"
                  placeholder="PAYMENT_METHOD"
                />
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Description</label>
                <input
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-white/10"
                  [(ngModel)]="codeDraft.description"
                  name="codeDescription"
                  placeholder="Payment method types"
                />
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                (click)="saveCode()"
                [disabled]="saving() || !codeDraft.codeType.trim()"
              >
                {{ editingCodeId() ? 'Save Changes' : 'Create Code' }}
              </button>
              <button
                type="button"
                class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
                (click)="resetCodeDraft()"
                [disabled]="saving()"
              >
                Reset
              </button>
              @if (editingCodeId()) {
                <button
                  type="button"
                  class="ml-auto rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200 dark:hover:bg-rose-950/50"
                  (click)="deleteCode(editingCodeId()!)"
                  [disabled]="saving()"
                >
                  Delete Code
                </button>
              }
            </div>
          </div>

          @if (!selectedCodeId()) {
            <div class="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-400">
              Select a code to manage values.
            </div>
          } @else {
            <div class="mt-6 flex items-center justify-between gap-3">
              <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Code Values</h3>
              <button
                type="button"
                class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                (click)="startNewCodeValue()"
              >
                New Value
              </button>
            </div>

            <div class="mt-3">
              <input
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-white/10"
                [(ngModel)]="codeValueSearchText"
                name="codeValueSearchText"
                placeholder="Search value, label or description..."
              />
            </div>

            <div class="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                <thead class="bg-slate-50 dark:bg-slate-800/40">
                  <tr>
                    <th class="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">Position</th>
                    <th class="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">Value</th>
                    <th class="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">Label</th>
                    <th class="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">Description</th>
                    <th class="px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (v of filteredCodeValues(); track v.id) {
                    <tr class="bg-white dark:bg-slate-900">
                      <td class="px-3 py-2 text-slate-600 dark:text-slate-300">{{ v.orderPosition }}</td>
                      <td class="px-3 py-2 font-medium text-slate-900 dark:text-slate-100">{{ v.value }}</td>
                      <td class="px-3 py-2 text-slate-700 dark:text-slate-200">{{ v.display }}</td>
                      <td class="px-3 py-2 text-slate-600 dark:text-slate-300">{{ v.description || '—' }}</td>
                      <td class="px-3 py-2">
                        <div class="flex justify-end gap-2">
                          <button
                            type="button"
                            class="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/60"
                            (click)="editCodeValue(v)"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            class="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200 dark:hover:bg-rose-950/50"
                            (click)="deleteCodeValue(v.id)"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                        No code values found.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="mt-5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-950/30">
              <h4 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ editingCodeValueId() ? 'Edit Code Value' : 'Create Code Value' }}</h4>
              <div class="mt-3 grid gap-3 sm:grid-cols-2">
                <div class="space-y-1.5">
                  <label class="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Value</label>
                  <input
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-white/10"
                    [(ngModel)]="codeValueDraft.value"
                    name="codeValueValue"
                    placeholder="CREDIT_CARD"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Label</label>
                  <input
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-white/10"
                    [(ngModel)]="codeValueDraft.display"
                    name="codeValueDisplay"
                    placeholder="Credit Card"
                  />
                </div>
                <div class="space-y-1.5 sm:col-span-2">
                  <label class="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Description</label>
                  <input
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-white/10"
                    [(ngModel)]="codeValueDraft.description"
                    name="codeValueDescription"
                    placeholder="Credit Card payment method"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Position</label>
                  <input
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-white/10"
                    [(ngModel)]="codeValueDraft.orderPosition"
                    name="codeValueOrder"
                    type="number"
                  />
                </div>
              </div>
              <div class="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                  (click)="saveCodeValue()"
                  [disabled]="saving() || !canSaveCodeValue()"
                >
                  {{ editingCodeValueId() ? 'Save Changes' : 'Create Value' }}
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
                  (click)="resetCodeValueDraft()"
                  [disabled]="saving()"
                >
                  Reset
                </button>
              </div>
            </div>
          }
        </section>
      </div>
    </div>
  `
})
export class ConfigurationComponent {
  private readonly api = inject(ConfigurationApiService);
  private readonly toast = inject(ToastService);

  readonly saving = signal(false);

  readonly codes = signal<CodeDto[]>([]);
  readonly selectedCodeId = signal<number | null>(null);
  readonly codeValues = signal<CodeValueDto[]>([]);
  codeSearchText = '';
  codeValueSearchText = '';

  readonly editingCodeId = signal<number | null>(null);
  codeDraft: CodeRequest = { codeType: '', description: '' };

  readonly editingCodeValueId = signal<number | null>(null);
  codeValueDraft: Partial<CodeValueRequest> = {
    codeId: undefined,
    value: '',
    display: '',
    description: '',
    orderPosition: 1
  };

  readonly selectedCode = computed(() => {
    const id = this.selectedCodeId();
    return this.codes().find((c) => c.id === id) ?? null;
  });

  filteredCodes(): CodeDto[] {
    const keyword = this.codeSearchText.trim().toLowerCase();
    const ordered = [...this.codes()].sort((a, b) => a.codeType.localeCompare(b.codeType));
    if (!keyword) return ordered;
    return ordered.filter(
      (c) =>
        c.codeType.toLowerCase().includes(keyword)
        || (c.description ?? '').toLowerCase().includes(keyword),
    );
  }

  filteredCodeValues(): CodeValueDto[] {
    const keyword = this.codeValueSearchText.trim().toLowerCase();
    const ordered = [...this.codeValues()].sort(
      (a, b) => a.orderPosition - b.orderPosition || a.id - b.id,
    );
    if (!keyword) return ordered;
    return ordered.filter(
      (v) =>
        v.value.toLowerCase().includes(keyword)
        || v.display.toLowerCase().includes(keyword)
        || (v.description ?? '').toLowerCase().includes(keyword),
    );
  }

  constructor() {
    void this.reloadCodes();
  }

  async reloadCodes(): Promise<void> {
    try {
      const list = await this.api.getAllCodes();
      this.codes.set(list);
      const selected = this.selectedCodeId();
      if (selected && !list.some((c) => c.id === selected)) {
        this.selectedCodeId.set(null);
        this.codeValues.set([]);
      }
    } catch (e) {
      this.toast.error(this.errMsg(e));
    }
  }

  async selectCode(c: CodeDto): Promise<void> {
    this.selectedCodeId.set(c.id);
    this.editingCodeId.set(c.id);
    this.codeValueSearchText = '';
    this.codeDraft = { codeType: c.codeType, description: c.description ?? '' };
    await this.reloadCodeValues(c.id);
    this.resetCodeValueDraft();
  }

  startNewCode(): void {
    this.editingCodeId.set(null);
    this.editingCodeValueId.set(null);
    this.selectedCodeId.set(null);
    this.codeValues.set([]);
    this.codeValueSearchText = '';
    this.codeDraft = { codeType: '', description: '' };
  }

  resetCodeDraft(): void {
    const selected = this.selectedCode();
    if (selected) {
      this.editingCodeId.set(selected.id);
      this.codeDraft = { codeType: selected.codeType, description: selected.description ?? '' };
      return;
    }
    this.startNewCode();
  }

  async saveCode(): Promise<void> {
    const codeType = this.codeDraft.codeType?.trim();
    if (!codeType) return;

    this.saving.set(true);
    try {
      const payload: CodeRequest = {
        codeType,
        description: this.codeDraft.description?.trim() ?? ''
      };
      const id = this.editingCodeId();
      if (id) {
        await this.api.updateCode(id, payload);
        this.toast.success('Code updated');
      } else {
        await this.api.createCode(payload);
        this.toast.success('Code created');
      }
      await this.reloadCodes();
    } catch (e) {
      this.toast.error(this.errMsg(e));
    } finally {
      this.saving.set(false);
    }
  }

  async deleteCode(id: number): Promise<void> {
    this.saving.set(true);
    try {
      await this.api.deleteCode(id);
      this.toast.success('Code deleted');
      if (this.selectedCodeId() === id) {
        this.selectedCodeId.set(null);
        this.codeValues.set([]);
      }
      this.startNewCode();
      await this.reloadCodes();
    } catch (e) {
      this.toast.error(this.errMsg(e));
    } finally {
      this.saving.set(false);
    }
  }

  async reloadCodeValues(codeId: number): Promise<void> {
    try {
      const list = await this.api.getCodeValuesByCodeId(codeId);
      this.codeValues.set(list);
    } catch (e) {
      this.toast.error(this.errMsg(e));
    }
  }

  startNewCodeValue(): void {
    this.editingCodeValueId.set(null);
    this.codeValueDraft = {
      codeId: this.selectedCodeId() ?? undefined,
      value: '',
      display: '',
      description: '',
      orderPosition: (this.codeValues().length || 0) + 1
    };
  }

  editCodeValue(v: CodeValueDto): void {
    this.editingCodeValueId.set(v.id);
    this.codeValueDraft = {
      codeId: v.codeId,
      value: v.value,
      display: v.display,
      description: v.description ?? '',
      orderPosition: v.orderPosition
    };
  }

  resetCodeValueDraft(): void {
    this.startNewCodeValue();
  }

  canSaveCodeValue(): boolean {
    const d = this.codeValueDraft;
    return !!(
      d.codeId
      && d.value?.trim()
      && d.display?.trim()
      && typeof d.orderPosition === 'number'
    );
  }

  async saveCodeValue(): Promise<void> {
    if (!this.canSaveCodeValue()) return;
    const codeId = this.selectedCodeId();
    if (!codeId) return;

    this.saving.set(true);
    try {
      const payload: CodeValueRequest = {
        codeId,
        value: (this.codeValueDraft.value ?? '').trim(),
        display: (this.codeValueDraft.display ?? '').trim(),
        description: (this.codeValueDraft.description ?? '').trim(),
        orderPosition: Number(this.codeValueDraft.orderPosition)
      };
      const id = this.editingCodeValueId();
      if (id) {
        await this.api.updateCodeValue(id, payload);
        this.toast.success('Code value updated');
      } else {
        await this.api.createCodeValue(payload);
        this.toast.success('Code value created');
      }
      await this.reloadCodeValues(codeId);
      this.startNewCodeValue();
    } catch (e) {
      this.toast.error(this.errMsg(e));
    } finally {
      this.saving.set(false);
    }
  }

  async deleteCodeValue(id: number): Promise<void> {
    const codeId = this.selectedCodeId();
    if (!codeId) return;

    this.saving.set(true);
    try {
      await this.api.deleteCodeValue(id);
      this.toast.success('Code value deleted');
      await this.reloadCodeValues(codeId);
      this.startNewCodeValue();
    } catch (e) {
      this.toast.error(this.errMsg(e));
    } finally {
      this.saving.set(false);
    }
  }

  private errMsg(e: unknown): string {
    return e instanceof Error ? e.message : 'Something went wrong';
  }
}

