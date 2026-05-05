import {
  Component,
  computed,
  inject,
  signal,
  HostListener,
} from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/toast/toast.service';
import { SessionService } from '../../core/user/session.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { EmployeeApiService } from './employee.api';
import type { EmployeeDto, EmployeeRequest } from './employee.model';
import nrcData from '../../data/nrc_data.json';
import myanmarTownships from '../../data/myanmar_township.json';

type NrcCitizenType = string;
interface NrcRegionRow {
  noEn: string;
  noMm: string;
  nameEn: string;
  nameMm: string;
}
interface NrcTownshipRow {
  code: string;
  mm: string;
}

const NRC_DATA: any = (nrcData as any)?.default ?? nrcData;
const MM_TOWNSHIPS: any = (myanmarTownships as any)?.default ?? myanmarTownships;

function buildNrcString(
  regionNo: string,
  townshipCode: string,
  citizenType: string,
  serialNo: string,
): string {
  if (!regionNo || !townshipCode || !citizenType || !serialNo) return '';
  return `${regionNo}/${townshipCode}(${citizenType})${serialNo}`;
}

function toNrcRegions(): NrcRegionRow[] {
  const states = (NRC_DATA as any).nrcStates as Array<any>;
  if (!Array.isArray(states)) return [];
  return states
    .map(s => ({
      noEn: String(s?.number?.en ?? s?.number ?? ''),
      noMm: String(s?.number?.mm ?? ''),
      nameEn: String(s?.name?.en ?? s?.name ?? ''),
      nameMm: String(s?.name?.mm ?? ''),
    }))
    .filter(r => !!r.noEn);
}

function toNrcCitizenTypes(): { value: NrcCitizenType; label: string }[] {
  const types = (NRC_DATA as any).nrcTypes as Array<any>;
  if (!Array.isArray(types)) return [];
  return types
    .map(t => ({
      value: String(t?.name?.en ?? t?.name ?? ''),
      label: `${String(t?.name?.en ?? t?.name ?? '')} (${String(t?.name?.mm ?? '')})`,
    }))
    .filter(t => !!t.value);
}

function extractMyanmarPhoneDigits(input?: string): string {
  if (!input) return '';
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('959')) return digits.slice(3);
  if (digits.startsWith('09')) return digits.slice(1);
  if (digits.startsWith('95')) return digits.slice(2);
  if (digits.startsWith('9')) return digits.slice(1);
  return digits;
}

function toNrcTownshipsByRegion(): Record<string, NrcTownshipRow[]> {
  // Prefer township short codes from nrc_data.json if present
  const list = (NRC_DATA as any).nrcTownships as Array<any>;
  const map: Record<string, NrcTownshipRow[]> = {};
  if (Array.isArray(list)) {
    for (const t of list) {
      const regionNo = String(t?.stateCode ?? t?.state?.number?.en ?? '');
      const code = String(t?.short?.en ?? t?.code ?? '');
      const mm = String(t?.short?.mm ?? t?.name?.mm ?? '');
      if (!regionNo || !code) continue;
      (map[regionNo] ??= []).push({ code, mm });
    }
    // stable ordering
    for (const k of Object.keys(map)) map[k].sort((a, b) => a.code.localeCompare(b.code));
    return map;
  }

  // Fallback: derive from myanmar_township.json (no NRC short codes, so use township CODE)
  const regions = (MM_TOWNSHIPS as any).regions as Array<any>;
  if (!Array.isArray(regions)) return {};
  for (const r of regions) {
    const regionNo = String(r?.nrc?.number?.en ?? r?.nrcNumber?.en ?? '');
    if (!regionNo) continue;
    const districts = Array.isArray(r?.districts) ? r.districts : [];
    for (const d of districts) {
      const townships = Array.isArray(d?.townships) ? d.townships : [];
      for (const ts of townships) {
        const code = String(ts?.code ?? '');
        const mm = String(ts?.name_mm ?? '');
        if (!code) continue;
        (map[regionNo] ??= []).push({ code, mm });
      }
    }
  }
  for (const k of Object.keys(map)) map[k].sort((a, b) => a.code.localeCompare(b.code));
  return map;
}

/* ─── profile avatars fallback (UI-Avatars) ─── */
function avatarUrl(name: string): string {
  const encoded = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encoded}&background=6366f1&color=fff&rounded=true&size=64`;
}

const POSITION_OPTIONS = ['MANAGER', 'SALESPERSON', 'HR', 'CASHIER', 'SECURITY', 'ACCOUNTANT', 'IT'];
const PAYLEVEL_OPTIONS = ['PL1', 'PL2', 'PL3', 'PL4', 'PL5'];

interface NrcDraft {
  regionNo: string;
  townshipCode: string;
  citizenType: string;
  serialNo: string;
}

function blankNrc(): NrcDraft {
  return { regionNo: '', townshipCode: '', citizenType: 'N', serialNo: '' };
}

function blankDraft(): EmployeeRequest & { _nrc: NrcDraft } {
  return {
    name: '',
    email: '',
    phoneNo: '',
    address: '',
    position: '',
    hireDate: '',
    dateOfBirth: '',
    payLevel: '',
    nrc: '',
    profilePicUrl: '',
    _nrc: blankNrc(),
  };
}

@Component({
  selector: 'app-employee-management',
  imports: [FormsModule, SlicePipe, TranslatePipe],
  template: `
<!-- ═══════════════════════════════════════════════════════════════════════ -->
<!--  EMPLOYEE MANAGEMENT                                                   -->
<!-- ═══════════════════════════════════════════════════════════════════════ -->
<div class="space-y-5">

  <!-- Page header -->
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{{ 'employees.title' | translate }}</h1>
      <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
        @if (canManage()) { {{ 'employees.subtitleManage' | translate }} } @else { {{ 'employees.subtitleReadonly' | translate }} }
      </p>
    </div>

    <!-- Action buttons -->
    @if (canManage()) {
    <div class="flex flex-wrap items-center gap-2 justify-end">
      <!-- Import Excel -->
      <label class="relative cursor-pointer">
        <input type="file" accept=".xlsx,.xls,.csv" class="sr-only" (change)="importExcel($event)" />
        <span class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
          <svg class="size-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 12V4m0 0L8 8m4-4 4 4"/>
          </svg>
          {{ 'employees.importExcel' | translate }}
        </span>
      </label>
      <!-- Export Excel -->
      <button type="button" (click)="exportExcel()"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
        <svg class="size-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v12m0 0 4-4m-4 4-4-4"/>
        </svg>
        {{ 'employees.exportExcel' | translate }}
      </button>
      <!-- New -->
      <button type="button" (click)="openCreateModal()"
        class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95">
        <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        {{ 'employees.newEmployee' | translate }}
      </button>
    </div>
    }
  </div>

  <!-- Permission error -->
  @if (!canView()) {
  <div class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
    You do not have permission to view employees.
  </div>
  } @else {

  <!-- ── Search & Filter bar ────────────────────────────────────────────── -->
  <div class="flex flex-wrap gap-2">
    <div class="relative flex-1 min-w-48">
      <svg class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
      </svg>
      <input [(ngModel)]="searchQuery" (ngModelChange)="onSearchChanged()" name="search" [placeholder]="'employees.searchPlaceholder' | translate"
        class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500" />
    </div>
    <select [(ngModel)]="filterPosition" (ngModelChange)="onFilterChanged()" name="filterPosition"
      class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <option value="">{{ 'employees.allPositions' | translate }}</option>
      @for (p of positionOptions; track p) { <option [value]="p">{{ p }}</option> }
    </select>
  </div>
  @if (loadingEmployees()) {
  <p class="text-xs text-indigo-600 dark:text-indigo-400">Loading employees...</p>
  }

  <!-- ── "New / Edit Employee" modal ───────────────────────────────────── -->
  @if (showCreateModal() && canManage()) {
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" (click)="closeCreateModal()"></div>
    <div class="relative z-10 w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">
          {{ editingId() ? ('employees.editEmployee' | translate) : ('employees.newEmployee' | translate) }}
        </h2>
        <button type="button" (click)="closeCreateModal()"
          class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200">
          <svg class="size-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Form grid -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <!-- Profile pic upload (top) -->
          <div class="sm:col-span-2 flex items-center gap-4">
            <div class="size-20 rounded-full ring-2 ring-indigo-200 dark:ring-indigo-900 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
              <img [src]="profilePicPreviewUrl || draft.profilePicUrl || avatarUrlSafe(draft.name)"
                alt="Profile"
                class="size-20 object-cover" width="80" height="80" />
            </div>
            <div class="flex-1 flex flex-col gap-1">
              <label class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ 'employees.profilePhoto' | translate }}</label>
              <label class="inline-flex w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                <input type="file" accept="image/*" class="sr-only" [disabled]="imageProcessing()" (change)="onProfilePicSelected($event)" />
                <svg class="size-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 7h3l2-3h8l2 3h3v14H3V7z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                </svg>
                {{ 'employees.uploadPhoto' | translate }}
              </label>
              @if (imageProcessing()) {
              <p class="text-xs text-indigo-600 dark:text-indigo-400">Optimizing image...</p>
              }
            </div>
          </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ 'employees.name' | translate }} <span class="text-rose-500">*</span></label>
          <input [(ngModel)]="draft.name" name="name" [placeholder]="'employees.namePlaceholder' | translate"
            class="input-field" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ 'common.email' | translate }}</label>
          <input [(ngModel)]="draft.email" name="em" type="email" [placeholder]="'common.email' | translate"
            class="input-field" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ 'employees.phone' | translate }} <span class="text-rose-500">*</span></label>
          <input [(ngModel)]="draft.phoneNo" name="ph" [placeholder]="'employees.phonePlaceholder' | translate"
            (blur)="normalizePhone()"
            class="input-field" />
          <p class="text-xs text-slate-500 dark:text-slate-400">Format: (+959)XXXXXXXXX</p>
          @if (phoneValidationMessage()) {
          <p class="text-xs text-rose-600 dark:text-rose-400">{{ phoneValidationMessage() }}</p>
          }
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ 'employees.position' | translate }}</label>
          <select [(ngModel)]="draft.position" name="pos" class="input-field">
            <option value="">{{ 'employees.selectPosition' | translate }}</option>
            @for (p of positionOptions; track p) { <option [value]="p">{{ p }}</option> }
          </select>
        </div>

        <!-- NRC Field (between phone/position and hire/dob) -->
        <div class="sm:col-span-2 flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ 'employees.nrc' | translate }}</label>
          <div class="grid grid-cols-4 gap-2">
            <select [(ngModel)]="draft._nrc.regionNo" name="nrcRegion" (ngModelChange)="onNrcRegionChange()"
              class="input-field text-xs">
              <option value="">Region</option>
              @for (r of nrcRegions; track r.noEn) {
                <option [value]="r.noEn">{{ r.noEn }} - {{ r.nameEn }} ({{ r.nameMm }})</option>
              }
            </select>
            <select [(ngModel)]="draft._nrc.townshipCode" name="nrcTownship"
              [disabled]="!draft._nrc.regionNo"
              class="input-field text-xs">
              <option value="">Township</option>
              @for (t of nrcTownshipsForRegion(); track t.code) {
                <option [value]="t.code">{{ t.code }}({{ t.mm }})</option>
              }
            </select>
            <select [(ngModel)]="draft._nrc.citizenType" name="nrcType" class="input-field text-xs">
              @for (ct of nrcCitizenTypes; track ct.value) {
                <option [value]="ct.value">{{ ct.label }}</option>
              }
            </select>
            <input [(ngModel)]="draft._nrc.serialNo" name="nrcSerial" placeholder="000000" maxlength="6" inputmode="numeric"
              (blur)="normalizeNrcSerial()"
              class="input-field text-xs" />
          </div>
          @if (nrcPreview()) {
          <p class="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-mono">
            {{ nrcPreview() }}
          </p>
          }
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ 'employees.hireDate' | translate }}</label>
          <input [(ngModel)]="draft.hireDate" name="hd" type="date" class="input-field" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ 'employees.dob' | translate }}</label>
          <input [(ngModel)]="draft.dateOfBirth" name="dob" type="date" class="input-field" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ 'employees.age' | translate }}</label>
          <input [value]="agePreview()" disabled class="input-field bg-slate-50 dark:bg-slate-900/60" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ 'employees.payLevel' | translate }}</label>
          <select [(ngModel)]="draft.payLevel" name="pl" class="input-field">
            <option value="">{{ 'employees.selectPayLevel' | translate }}</option>
            @for (pl of payLevelOptions; track pl) { <option [value]="pl">{{ pl }}</option> }
          </select>
        </div>
        <div class="sm:col-span-2 flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ 'employees.address' | translate }}</label>
          <input [(ngModel)]="draft.address" name="addr" [placeholder]="'employees.addressPlaceholder' | translate"
            class="input-field" />
        </div>

        <!-- NRC moved above -->

      </div>

      <div class="mt-5 flex flex-wrap gap-2 justify-end">
        <button type="button" (click)="closeCreateModal()" [disabled]="saving()"
          class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {{ 'common.cancel' | translate }}
        </button>
        <button type="button" (click)="save()" [disabled]="saving() || imageProcessing() || !isValidDraft()"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60">
          @if (saving()) { {{ 'employees.saving' | translate }} } @else { {{ editingId() ? ('employees.saveChanges' | translate) : ('employees.createEmployee' | translate) }} }
        </button>
      </div>
    </div>
  </div>
  }

  <!-- ── Employee Table ──────────────────────────────────────────────────── -->
  <div class="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:border-slate-700/60 dark:bg-slate-900">
    <table class="min-w-full text-sm">
      <thead class="bg-slate-50 dark:bg-slate-800/50">
        <tr class="border-b border-slate-200 dark:border-slate-700">
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Employee</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 hidden sm:table-cell">Contact</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 hidden md:table-cell">Position</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 hidden md:table-cell">Service Year</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 hidden lg:table-cell">NRC</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 hidden lg:table-cell">Hire Date</th>
          @if (canManage()) {
          <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
          }
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
        @for (e of filteredEmployees(); track e.id) {
        <tr (click)="viewEmployee(e)"
          class="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
          <!-- Avatar + Name -->
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <img [src]="e.profilePicUrl || fallbackAvatar(e)"
                alt="{{ e.name }}"
                class="size-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                width="36" height="36" />
              <div>
                <p class="font-semibold text-slate-900 dark:text-slate-100">{{ e.name }}</p>
                <p class="text-xs text-slate-400 sm:hidden">{{ e.email || '—' }}</p>
              </div>
            </div>
          </td>
          <!-- Contact -->
          <td class="px-4 py-3 hidden sm:table-cell">
            <p class="text-slate-700 dark:text-slate-200">{{ e.email || '—' }}</p>
            <p class="text-xs text-slate-400">{{ e.phoneNo }}</p>
          </td>
          <!-- Position -->
          <td class="px-4 py-3 hidden md:table-cell">
            @if (e.position) {
            <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              [class]="positionBadgeClass(e.position)">
              {{ e.position }}
            </span>
            } @else { <span class="text-slate-400">—</span> }
          </td>
          <!-- Service year -->
          <td class="px-4 py-3 hidden md:table-cell text-slate-600 dark:text-slate-300 text-xs">
            {{ e.serviceYear ?? serviceYearFallback(e) ?? '—' }}
          </td>
          <!-- NRC -->
          <td class="px-4 py-3 hidden lg:table-cell font-mono text-xs text-slate-600 dark:text-slate-300">
            {{ e.nrc || '—' }}
          </td>
          <!-- Hire Date -->
          <td class="px-4 py-3 hidden lg:table-cell text-slate-500 dark:text-slate-400 text-xs">
            {{ e.hireDate | slice:0:10 }}
          </td>
          <!-- Actions -->
          @if (canManage()) {
          <td class="px-4 py-3" (click)="$event.stopPropagation()">
            <div class="flex justify-end gap-2">
              <button type="button" (click)="edit(e)"
                class="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Edit
              </button>
              <button type="button" (click)="remove(e.id)"
                [disabled]="saving() || deletingId() === e.id"
                class="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                {{ deletingId() === e.id ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </td>
          }
        </tr>
        } @empty {
        <tr>
          <td [attr.colspan]="canManage() ? 6 : 5"
            class="px-4 py-12 text-center text-slate-400 dark:text-slate-500">
            <div class="flex flex-col items-center gap-2">
              <svg class="size-10 text-slate-200 dark:text-slate-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
              </svg>
              <span>No employees found.</span>
            </div>
          </td>
        </tr>
        }
      </tbody>
    </table>
    <!-- Footer count -->
    @if (filteredEmployees().length > 0) {
    <div class="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500 flex items-center justify-between gap-3">
      <span>Showing {{ filteredEmployees().length }} of {{ totalItems() }} employees</span>
      <div class="flex items-center gap-2">
        <button type="button" (click)="prevPage()" [disabled]="loadingEmployees() || currentPage() <= 1"
          class="rounded border border-slate-200 px-2 py-1 disabled:opacity-50 dark:border-slate-700">
          Prev
        </button>
        <span>Page {{ currentPage() }} / {{ totalPages() }}</span>
        <button type="button" (click)="nextPage()" [disabled]="loadingEmployees() || currentPage() >= totalPages()"
          class="rounded border border-slate-200 px-2 py-1 disabled:opacity-50 dark:border-slate-700">
          Next
        </button>
      </div>
    </div>
    }
  </div>

  } <!-- end canView -->

  <!-- ─────────────────────────────────────────────────────────────────── -->
  <!-- VIEW MODAL (click on row)                                          -->
  <!-- ─────────────────────────────────────────────────────────────────── -->
  @if (viewingEmployee()) {
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Overlay -->
    <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" (click)="closeView()"></div>

    <!-- Modal card -->
    <div class="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
      <!-- Header band -->
      <div class="relative h-28 rounded-t-2xl bg-gradient-to-r from-indigo-600 to-violet-600">
        <button type="button" (click)="closeView()"
          class="absolute right-3 top-3 rounded-lg p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition">
          <svg class="size-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <!-- Avatar -->
        <div class="absolute -bottom-10 left-6">
          <img [src]="viewingEmployee()!.profilePicUrl || fallbackAvatar(viewingEmployee()!)"
            alt="{{ viewingEmployee()!.name }}"
            class="size-20 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900"
            width="80" height="80" />
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 pt-14 pb-6">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">
              {{ viewingEmployee()!.name }}
            </h2>
            @if (viewingEmployee()!.position) {
            <span class="mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              [class]="positionBadgeClass(viewingEmployee()!.position!)">
              {{ viewingEmployee()!.position }}
            </span>
            }
          </div>
          @if (canManage()) {
          <button type="button" (click)="editFromView(viewingEmployee()!)"
            class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            Edit
          </button>
          }
        </div>

        <dl class="mt-4 grid grid-cols-1 gap-y-3 sm:grid-cols-2 text-sm">
          <div class="flex flex-col">
            <dt class="text-xs text-slate-400">Email</dt>
            <dd class="text-slate-700 dark:text-slate-200 truncate">{{ viewingEmployee()!.email || '—' }}</dd>
          </div>
          <div class="flex flex-col">
            <dt class="text-xs text-slate-400">Phone</dt>
            <dd class="text-slate-700 dark:text-slate-200">{{ viewingEmployee()!.phoneNo }}</dd>
          </div>
          @if (viewingEmployee()!.nrc) {
          <div class="flex flex-col sm:col-span-2">
            <dt class="text-xs text-slate-400">NRC</dt>
            <dd class="font-mono text-slate-700 dark:text-slate-200">{{ viewingEmployee()!.nrc }}</dd>
          </div>
          }
          @if (viewingEmployee()!.address) {
          <div class="flex flex-col sm:col-span-2">
            <dt class="text-xs text-slate-400">Address</dt>
            <dd class="text-slate-700 dark:text-slate-200">{{ viewingEmployee()!.address }}</dd>
          </div>
          }
          @if (viewingEmployee()!.dateOfBirth) {
          <div class="flex flex-col">
            <dt class="text-xs text-slate-400">Date of Birth</dt>
            <dd class="text-slate-700 dark:text-slate-200">{{ viewingEmployee()!.dateOfBirth | slice:0:10 }}</dd>
          </div>
          }
          @if (viewingEmployee()!.hireDate) {
          <div class="flex flex-col">
            <dt class="text-xs text-slate-400">Hire Date</dt>
            <dd class="text-slate-700 dark:text-slate-200">{{ viewingEmployee()!.hireDate | slice:0:10 }}</dd>
          </div>
          }
          @if (viewingEmployee()!.serviceYear !== null && viewingEmployee()!.serviceYear !== undefined) {
          <div class="flex flex-col">
            <dt class="text-xs text-slate-400">Service Year</dt>
            <dd class="text-slate-700 dark:text-slate-200">{{ viewingEmployee()!.serviceYear }}</dd>
          </div>
          }
          @if (viewingEmployee()!.payLevel) {
          <div class="flex flex-col">
            <dt class="text-xs text-slate-400">Pay Level</dt>
            <dd class="text-slate-700 dark:text-slate-200">{{ viewingEmployee()!.payLevel }}</dd>
          </div>
          }
        </dl>
      </div>
    </div>
  </div>
  }

</div>

<!-- ── Styles scoped to component ──────────────────────────────────────── -->
<style>
  @reference "../../../styles.css";
  .input-field {
    @apply w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm
           focus:outline-none focus:ring-2 focus:ring-indigo-500/40
           dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder-slate-500;
  }
</style>
  `,
})
export class EmployeeManagementComponent {
  private readonly api = inject(EmployeeApiService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);

  /* ── State ──────────────────────────────────────────────────────────── */
  readonly employees = signal<EmployeeDto[]>([]);
  readonly saving = signal(false);
  readonly loadingEmployees = signal(false);
  readonly deletingId = signal<number | null>(null);
  readonly imageProcessing = signal(false);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);
  readonly pageSize = signal(10);
  readonly editingId = signal<number | null>(null);
  readonly showCreateModal = signal(false);
  readonly viewingEmployee = signal<EmployeeDto | null>(null);

  /* ── Search / filter ────────────────────────────────────────────────── */
  searchQuery = '';
  filterPosition = '';

  /* ── NRC static data ────────────────────────────────────────────────── */
  readonly nrcRegions = toNrcRegions();
  readonly nrcCitizenTypes = toNrcCitizenTypes();
  private readonly nrcTownshipsByRegion = toNrcTownshipsByRegion();

  /* ── Draft form ─────────────────────────────────────────────────────── */
  draft: EmployeeRequest & { _nrc: NrcDraft } = blankDraft();
  profilePicPreviewUrl = '';

  readonly positionOptions = POSITION_OPTIONS;
  readonly payLevelOptions = PAYLEVEL_OPTIONS;

  /* ── Computed ────────────────────────────────────────────────────────── */
  readonly canView = computed(() => {
    const r = this.session.user()?.role;
    return r === 'system_admin' || r === 'company_admin';
  });
  readonly canManage = computed(() => this.session.user()?.role === 'company_admin');

  readonly filteredEmployees = computed(() => {
    const q = this.searchQuery.toLowerCase();
    const pos = this.filterPosition;
    return this.employees().filter(e => {
      const matchesSearch = !q
        || `${e.name}`.toLowerCase().includes(q)
        || `${e.email ?? ''}`.toLowerCase().includes(q)
        || e.phoneNo.includes(q);
      const matchesPos = !pos || e.position === pos;
      return matchesSearch && matchesPos;
    });
  });

  nrcTownshipsForRegion(): NrcTownshipRow[] {
    const r = this.draft._nrc.regionNo;
    return r ? (this.nrcTownshipsByRegion[r] ?? []) : [];
  }

  nrcPreview(): string {
    return buildNrcString(
      this.draft._nrc.regionNo,
      this.draft._nrc.townshipCode,
      this.draft._nrc.citizenType,
      this.draft._nrc.serialNo,
    );
  }

  /* ── Lifecycle ──────────────────────────────────────────────────────── */
  constructor() {
    void this.reload();
  }

  /* ── Data loading ───────────────────────────────────────────────────── */
  async reload(): Promise<void> {
    if (!this.canView()) return;
    this.loadingEmployees.set(true);
    try {
      const res = await this.api.list({
        page: this.currentPage(),
        size: this.pageSize(),
        keyword: this.searchQuery.trim() || undefined,
      });
      this.employees.set(res.data ?? []);
      this.totalItems.set(res.meta?.totalItems ?? 0);
      this.totalPages.set(Math.max(1, res.meta?.totalPages ?? 1));
      this.currentPage.set(Math.max(1, res.meta?.currentPage ?? this.currentPage()));
    } catch {
      this.employees.set([]);
      this.totalItems.set(0);
      this.totalPages.set(1);
    } finally {
      this.loadingEmployees.set(false);
    }
  }

  /* ── Form helpers ───────────────────────────────────────────────────── */
  isValidDraft(): boolean {
    return !!this.draft.name?.trim()
      && this.isValidPhone(this.draft.phoneNo);
  }

  onSearchChanged(): void {
    this.currentPage.set(1);
    void this.reload();
  }

  onFilterChanged(): void {
    this.currentPage.set(1);
    void this.reload();
  }

  nextPage(): void {
    if (this.currentPage() >= this.totalPages()) return;
    this.currentPage.set(this.currentPage() + 1);
    void this.reload();
  }

  prevPage(): void {
    if (this.currentPage() <= 1) return;
    this.currentPage.set(this.currentPage() - 1);
    void this.reload();
  }

  toggleNewForm(): void {
    // legacy (kept for compatibility if referenced elsewhere)
    this.openCreateModal();
  }

  openCreateModal(): void {
    this.resetDraft();
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.resetDraft();
  }

  resetDraft(): void {
    this.editingId.set(null);
    this.revokeProfilePreviewUrl();
    this.draft = blankDraft();
  }

  onNrcRegionChange(): void {
    this.draft._nrc.townshipCode = '';
  }

  /* ── CRUD ───────────────────────────────────────────────────────────── */
  edit(e: EmployeeDto): void {
    this.editingId.set(e.id);
    // Parse existing NRC back into parts (if any)
    const nrcParts = parseNrc(e.nrc ?? '');
    this.draft = {
      name: e.name,
      email: e.email ?? '',
      phoneNo: e.phoneNo,
      address: e.address ?? '',
      position: e.position ?? '',
      hireDate: e.hireDate ?? '',
      dateOfBirth: e.dateOfBirth ?? '',
      payLevel: e.payLevel ?? '',
      nrc: e.nrc ?? '',
      profilePicUrl: e.profilePicUrl ?? '',
      _nrc: nrcParts,
    };
    this.normalizePhone();
    this.profilePicPreviewUrl = '';
    this.showCreateModal.set(true);
  }

  editFromView(e: EmployeeDto): void {
    this.closeView();
    this.edit(e);
  }

  async save(): Promise<void> {
    this.normalizePhone();
    if (!this.canManage() || !this.isValidDraft()) return;
    this.normalizeNrcSerial();
    this.saving.set(true);
    try {
      const payload: EmployeeRequest = {
        name: this.draft.name.trim(),
        phoneNo: this.draft.phoneNo.trim(),
        address: this.draft.address?.trim(),
        position: this.draft.position?.trim(),
        hireDate: this.draft.hireDate,
        dateOfBirth: this.draft.dateOfBirth,
        payLevel: this.draft.payLevel?.trim(),
        profilePicUrl: this.draft.profilePicUrl?.trim(),
        nrc: this.nrcPreview() || this.draft.nrc?.trim(),
      };
      const email = this.draft.email?.trim();
      if (email) payload.email = email;
      const id = this.editingId();
      if (id) {
        await this.api.update(id, payload);
        this.toast.success('Employee updated');
      } else {
        await this.api.create(payload);
        this.toast.success('Employee created');
      }
      await this.reload();
      this.closeCreateModal();
    } catch (e) {
      this.toast.error(this.errMsg(e));
    } finally {
      this.saving.set(false);
    }
  }

  normalizePhone(): void {
    const raw = (this.draft.phoneNo ?? '').trim();
    if (!raw) return;
    const localDigits = extractMyanmarPhoneDigits(raw).slice(0, 9);
    this.draft.phoneNo = localDigits ? `(+959)${localDigits}` : '';
  }

  async remove(id: number): Promise<void> {
    if (!this.canManage()) return;
    if (!confirm('Delete this employee?')) return;
    this.saving.set(true);
    this.deletingId.set(id);
    try {
      await this.api.delete(id);
      this.toast.success('Employee deleted');
      await this.reload();
      if (this.editingId() === id) this.closeCreateModal();
    } catch (e) {
      this.toast.error(this.errMsg(e));
    } finally {
      this.deletingId.set(null);
      this.saving.set(false);
    }
  }

  /* ── View modal ─────────────────────────────────────────────────────── */
  viewEmployee(e: EmployeeDto): void {
    this.viewingEmployee.set(e);
  }

  closeView(): void {
    this.viewingEmployee.set(null);
  }

  /* ── Excel ──────────────────────────────────────────────────────────── */
  importExcel(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.toast.success(`"${file.name}" ready to import (backend integration pending)`);
    (event.target as HTMLInputElement).value = '';
  }

  exportExcel(): void {
    const rows = [
      ['ID', 'Name', 'Email', 'Phone', 'Position', 'Service Year', 'NRC', 'Hire Date', 'Pay Level'],
      ...this.filteredEmployees().map(e => [
        e.id, e.name, e.email, e.phoneNo,
        e.position ?? '', (e.serviceYear ?? this.serviceYearFallback(e) ?? ''),
        e.nrc ?? '', e.hireDate ?? '', e.payLevel ?? '',
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.success('Exported as CSV');
  }

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  fallbackAvatar(e: EmployeeDto): string {
    return avatarUrl(`${e.name}`);
  }

  avatarUrlSafe(name?: string): string {
    return avatarUrl((name ?? '').trim() || 'Employee');
  }

  agePreview(): string {
    const dob = this.draft.dateOfBirth;
    const age = calcAge(dob);
    return age === null ? '—' : String(age);
  }

  serviceYearFallback(e: EmployeeDto): number | null {
    if (!e.hireDate) return null;
    const hire = new Date(e.hireDate);
    if (Number.isNaN(hire.getTime())) return null;
    const today = new Date();
    let years = today.getFullYear() - hire.getFullYear();
    const m = today.getMonth() - hire.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < hire.getDate())) years -= 1;
    return years < 0 ? 0 : years;
  }

  onProfilePicSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.setProfilePreviewUrl(URL.createObjectURL(file));
    this.imageProcessing.set(true);
    void this.compressImageFile(file).then(dataUrl => {
      this.draft.profilePicUrl = dataUrl;
    }).catch(() => {
      // Fallback for unsupported browsers or decode errors.
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') this.draft.profilePicUrl = result;
      };
      reader.readAsDataURL(file);
    }).finally(() => {
      this.imageProcessing.set(false);
    });
    (event.target as HTMLInputElement).value = '';
  }

  positionBadgeClass(position: string): string {
    const map: Record<string, string> = {
      MANAGER:     'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
      HR:          'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
      SALESPERSON: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
      CASHIER:     'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
      SECURITY:    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      ACCOUNTANT:  'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
      IT:          'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300',
    };
    return map[position] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  }

  private errMsg(e: unknown): string {
    return e instanceof Error ? e.message : 'Something went wrong';
  }

  phoneValidationMessage(): string {
    const raw = (this.draft.phoneNo ?? '').trim();
    if (!raw) return '';
    if (!this.isValidPhone(raw)) return 'Phone must be (+959) followed by up to 9 digits.';
    return '';
  }

  private isValidPhone(input?: string): boolean {
    const value = (input ?? '').trim();
    if (!value) return false;
    return /^\(\+959\)\d{1,9}$/.test(value);
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.viewingEmployee()) this.closeView();
    else if (this.showCreateModal()) this.closeCreateModal();
  }

  normalizeNrcSerial(): void {
    const raw = (this.draft._nrc.serialNo ?? '').toString().replace(/\D/g, '');
    if (!raw) {
      this.draft._nrc.serialNo = '';
      return;
    }
    this.draft._nrc.serialNo = raw.slice(0, 6).padStart(6, '0');
  }

  private setProfilePreviewUrl(url: string): void {
    this.revokeProfilePreviewUrl();
    this.profilePicPreviewUrl = url;
  }

  private revokeProfilePreviewUrl(): void {
    if (this.profilePicPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.profilePicPreviewUrl);
    }
    this.profilePicPreviewUrl = '';
  }

  private async compressImageFile(file: File): Promise<string> {
    const bitmap = await createImageBitmap(file);
    const maxSize = 1024;
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
    const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context is not available');
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close();

    const compressed = canvas.toDataURL('image/webp', 0.82);
    return compressed.startsWith('data:') ? compressed : canvas.toDataURL('image/jpeg', 0.85);
  }
}

function calcAge(dob?: string): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
  if (age < 0 || age > 130) return null;
  return age;
}

/* ── Utility: parse an existing NRC string back to parts ─────────────────── */
function parseNrc(nrc: string): NrcDraft {
  if (!nrc) return blankNrc();
  // Format: "{regionNo}/{townshipCode}({citizenType}){serialNo}"
  const match = nrc.match(/^(\d+)\/([^(]+)\(([^)]+)\)(\d+)$/);
  if (!match) return blankNrc();
  return {
    regionNo: match[1],
    townshipCode: match[2],
    citizenType: match[3],
    serialNo: match[4],
  };
}
