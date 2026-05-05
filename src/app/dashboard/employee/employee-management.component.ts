import {
  Component,
  computed,
  inject,
  signal,
  HostListener,
} from '@angular/core';
import { DecimalPipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/toast/toast.service';
import { SessionService } from '../../core/user/session.service';
import { EmployeeApiService } from './employee.api';
import type { EmployeeDto, EmployeeRequest } from './employee.model';
import {
  NRC_REGIONS,
  NRC_TOWNSHIPS,
  NRC_CITIZEN_TYPES,
  buildNrcString,
} from './nrc-data';

/* ─── dummy profile avatars (UI-Avatars API – no real photo data stored) ─── */
function avatarUrl(name: string): string {
  const encoded = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encoded}&background=6366f1&color=fff&rounded=true&size=64`;
}

/* ─── dummy seed data ─────────────────────────────────────────────────────── */
const DUMMY_EMPLOYEES: EmployeeDto[] = [
  {
    id: 1001,
    firstName: 'Aung',
    lastName: 'Kyaw',
    email: 'aung.kyaw@nexus.com',
    phoneNo: '09-451-234567',
    position: 'MANAGER',
    hireDate: '2022-01-15',
    address: 'No.12, Bogyoke Rd, Yangon',
    nrc: '12/LaKaNa(N)123456',
    salary: '850000',
    profilePicUrl: avatarUrl('Aung Kyaw'),
    dateOfBirth: '1990-03-22',
  },
  {
    id: 1002,
    firstName: 'Moe',
    lastName: 'Zin',
    email: 'moe.zin@nexus.com',
    phoneNo: '09-765-432100',
    position: 'SALESPERSON',
    hireDate: '2023-04-01',
    address: 'No.5, Pansodan St, Yangon',
    nrc: '6/AhLone(N)987654',
    salary: '600000',
    profilePicUrl: avatarUrl('Moe Zin'),
    dateOfBirth: '1995-07-11',
  },
  {
    id: 1003,
    firstName: 'Su',
    lastName: 'Myat',
    email: 'su.myat@nexus.com',
    phoneNo: '09-250-111222',
    position: 'HR',
    hireDate: '2021-09-10',
    address: 'No.33, Inya Rd, Kamayut, Yangon',
    nrc: '6/KaMarYut(N)224466',
    salary: '700000',
    profilePicUrl: avatarUrl('Su Myat'),
    dateOfBirth: '1992-11-05',
  },
  {
    id: 1004,
    firstName: 'Thida',
    lastName: 'Win',
    email: 'thida.win@nexus.com',
    phoneNo: '09-401-998877',
    position: 'CASHIER',
    hireDate: '2024-02-20',
    address: 'No.7, 37th St, Mandalay',
    nrc: '2/MANaLA(N)554433',
    salary: '500000',
    profilePicUrl: avatarUrl('Thida Win'),
    dateOfBirth: '1998-01-30',
  },
  {
    id: 1005,
    firstName: 'Kyaw',
    lastName: 'Swar',
    email: 'kyaw.swar@nexus.com',
    phoneNo: '09-787-654321',
    position: 'SECURITY',
    hireDate: '2023-07-14',
    address: 'No.20, Myoma Market Rd, Mandalay',
    nrc: '2/MeiKhtiLa(N)776655',
    salary: '450000',
    profilePicUrl: avatarUrl('Kyaw Swar'),
    dateOfBirth: '1985-06-18',
  },
  {
    id: 1006,
    firstName: 'May',
    lastName: 'Thu',
    email: 'may.thu@nexus.com',
    phoneNo: '09-310-567890',
    position: 'SALESPERSON',
    hireDate: '2022-11-01',
    address: 'No.9, Strand Rd, Yangon',
    nrc: '6/BaHan(N)334455',
    salary: '620000',
    profilePicUrl: avatarUrl('May Thu'),
    dateOfBirth: '1997-09-25',
  },
];

const POSITION_OPTIONS = ['MANAGER', 'SALESPERSON', 'HR', 'CASHIER', 'SECURITY', 'ACCOUNTANT', 'IT'];

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
    firstName: '',
    lastName: '',
    email: '',
    phoneNo: '',
    address: '',
    position: '',
    hireDate: '',
    dateOfBirth: '',
    salary: '',
    nrc: '',
    profilePicUrl: '',
    _nrc: blankNrc(),
  };
}

@Component({
  selector: 'app-employee-management',
  imports: [FormsModule, DecimalPipe, SlicePipe],
  template: `
<!-- ═══════════════════════════════════════════════════════════════════════ -->
<!--  EMPLOYEE MANAGEMENT                                                   -->
<!-- ═══════════════════════════════════════════════════════════════════════ -->
<div class="space-y-5">

  <!-- Page header -->
  <div class="flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Employees</h1>
      <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
        @if (canManage()) { Manage your team members. } @else { Read-only view. }
      </p>
    </div>

    <!-- Action buttons -->
    @if (canManage()) {
    <div class="flex flex-wrap items-center gap-2">
      <!-- Excel Import -->
      <label class="relative cursor-pointer">
        <input type="file" accept=".xlsx,.xls,.csv" class="sr-only" (change)="importExcel($event)" />
        <span class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
          <svg class="size-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4 4 4"/>
          </svg>
          Import Excel
        </span>
      </label>
      <!-- Excel Export -->
      <button type="button" (click)="exportExcel()"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
        <svg class="size-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0 4-4m-4 4-4-4"/>
        </svg>
        Export Excel
      </button>
      <!-- New Employee (dropdown trigger) -->
      <div class="relative">
        <button type="button" (click)="toggleNewForm()"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95">
          <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          New Employee
        </button>
      </div>
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
      <input [(ngModel)]="searchQuery" name="search" placeholder="Search name, email, phone…"
        class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500" />
    </div>
    <select [(ngModel)]="filterPosition" name="filterPosition"
      class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <option value="">All Positions</option>
      @for (p of positionOptions; track p) { <option [value]="p">{{ p }}</option> }
    </select>
  </div>

  <!-- ── "New Employee" dropdown panel ──────────────────────────────────── -->
  @if (showNewForm() && canManage()) {
  <div class="relative">
    <div class="absolute right-0 top-0 z-30 w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:ring-white/10">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">
          {{ editingId() ? 'Edit Employee' : 'New Employee' }}
        </h2>
        <button type="button" (click)="closeForm()"
          class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200">
          <svg class="size-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Form grid -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">First Name <span class="text-rose-500">*</span></label>
          <input [(ngModel)]="draft.firstName" name="fn" placeholder="First name"
            class="input-field" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Last Name <span class="text-rose-500">*</span></label>
          <input [(ngModel)]="draft.lastName" name="ln" placeholder="Last name"
            class="input-field" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Email <span class="text-rose-500">*</span></label>
          <input [(ngModel)]="draft.email" name="em" type="email" placeholder="Email"
            class="input-field" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Phone <span class="text-rose-500">*</span></label>
          <input [(ngModel)]="draft.phoneNo" name="ph" placeholder="09-xxx-xxxxxx"
            class="input-field" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Position</label>
          <select [(ngModel)]="draft.position" name="pos" class="input-field">
            <option value="">Select position</option>
            @for (p of positionOptions; track p) { <option [value]="p">{{ p }}</option> }
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Hire Date</label>
          <input [(ngModel)]="draft.hireDate" name="hd" type="date" class="input-field" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Date of Birth</label>
          <input [(ngModel)]="draft.dateOfBirth" name="dob" type="date" class="input-field" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Salary (MMK)</label>
          <input [(ngModel)]="draft.salary" name="sal" type="number" placeholder="0"
            class="input-field" />
        </div>
        <div class="sm:col-span-2 flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Address</label>
          <input [(ngModel)]="draft.address" name="addr" placeholder="Address"
            class="input-field" />
        </div>

        <!-- NRC Field -->
        <div class="sm:col-span-2 flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">NRC (မှတ်ပုံတင်)</label>
          <div class="grid grid-cols-4 gap-2">
            <!-- Region No. -->
            <select [(ngModel)]="draft._nrc.regionNo" name="nrcRegion" (ngModelChange)="onNrcRegionChange()"
              class="input-field text-xs">
              <option value="">Region</option>
              @for (r of nrcRegions; track r.no) { <option [value]="r.no">{{ r.no }}</option> }
            </select>
            <!-- Township code (dynamic) -->
            <select [(ngModel)]="draft._nrc.townshipCode" name="nrcTownship"
              [disabled]="!draft._nrc.regionNo"
              class="input-field text-xs">
              <option value="">Township</option>
              @for (t of nrcTownshipsForRegion(); track t.code) {
                <option [value]="t.code">{{ t.code }}</option>
              }
            </select>
            <!-- Citizen type -->
            <select [(ngModel)]="draft._nrc.citizenType" name="nrcType" class="input-field text-xs">
              @for (ct of nrcCitizenTypes; track ct.value) {
                <option [value]="ct.value">{{ ct.value }}</option>
              }
            </select>
            <!-- Serial No. -->
            <input [(ngModel)]="draft._nrc.serialNo" name="nrcSerial" placeholder="000000" maxlength="6"
              class="input-field text-xs" />
          </div>
          <!-- Preview -->
          @if (nrcPreview()) {
          <p class="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-mono">
            {{ nrcPreview() }}
          </p>
          }
        </div>

        <!-- Profile pic URL (manual for now) -->
        <div class="sm:col-span-2 flex flex-col gap-1">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Profile Picture URL</label>
          <input [(ngModel)]="draft.profilePicUrl" name="pic" placeholder="https://…"
            class="input-field" />
        </div>
      </div>

      <div class="mt-5 flex flex-wrap gap-2 justify-end">
        <button type="button" (click)="closeForm()" [disabled]="saving()"
          class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          Cancel
        </button>
        <button type="button" (click)="save()" [disabled]="saving() || !isValidDraft()"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60">
          @if (saving()) { Saving… } @else { {{ editingId() ? 'Save Changes' : 'Create Employee' }} }
        </button>
      </div>
    </div>
  </div>
  <div class="h-4"></div>
  }

  <!-- ── Employee Table ──────────────────────────────────────────────────── -->
  <div class="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:border-slate-700/60 dark:bg-slate-900">
    <table class="min-w-full text-sm">
      <thead class="bg-slate-50 dark:bg-slate-800/50">
        <tr class="border-b border-slate-200 dark:border-slate-700">
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Employee</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 hidden sm:table-cell">Contact</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 hidden md:table-cell">Position</th>
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
                alt="{{ e.firstName }} {{ e.lastName }}"
                class="size-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                width="36" height="36" />
              <div>
                <p class="font-semibold text-slate-900 dark:text-slate-100">{{ e.firstName }} {{ e.lastName }}</p>
                <p class="text-xs text-slate-400 sm:hidden">{{ e.email }}</p>
              </div>
            </div>
          </td>
          <!-- Contact -->
          <td class="px-4 py-3 hidden sm:table-cell">
            <p class="text-slate-700 dark:text-slate-200">{{ e.email }}</p>
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
                class="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                Delete
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
    <div class="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
      Showing {{ filteredEmployees().length }} of {{ employees().length }} employees
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
    <div class="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
      <!-- Header band -->
      <div class="relative h-24 rounded-t-2xl bg-gradient-to-r from-indigo-600 to-violet-600">
        <button type="button" (click)="closeView()"
          class="absolute right-3 top-3 rounded-lg p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition">
          <svg class="size-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <!-- Avatar -->
        <div class="absolute -bottom-8 left-6">
          <img [src]="viewingEmployee()!.profilePicUrl || fallbackAvatar(viewingEmployee()!)"
            alt="{{ viewingEmployee()!.firstName }}"
            class="size-16 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900"
            width="64" height="64" />
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 pt-12 pb-6">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">
              {{ viewingEmployee()!.firstName }} {{ viewingEmployee()!.lastName }}
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
            <dd class="text-slate-700 dark:text-slate-200 truncate">{{ viewingEmployee()!.email }}</dd>
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
          @if (viewingEmployee()!.salary) {
          <div class="flex flex-col">
            <dt class="text-xs text-slate-400">Salary (MMK)</dt>
            <dd class="text-slate-700 dark:text-slate-200">{{ viewingEmployee()!.salary | number }}</dd>
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
  readonly editingId = signal<number | null>(null);
  readonly showNewForm = signal(false);
  readonly viewingEmployee = signal<EmployeeDto | null>(null);

  /* ── Search / filter ────────────────────────────────────────────────── */
  searchQuery = '';
  filterPosition = '';

  /* ── NRC static data ────────────────────────────────────────────────── */
  readonly nrcRegions = NRC_REGIONS;
  readonly nrcCitizenTypes = NRC_CITIZEN_TYPES;

  /* ── Draft form ─────────────────────────────────────────────────────── */
  draft: EmployeeRequest & { _nrc: NrcDraft } = blankDraft();

  readonly positionOptions = POSITION_OPTIONS;

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
        || `${e.firstName} ${e.lastName}`.toLowerCase().includes(q)
        || e.email.toLowerCase().includes(q)
        || e.phoneNo.includes(q);
      const matchesPos = !pos || e.position === pos;
      return matchesSearch && matchesPos;
    });
  });

  readonly nrcTownshipsForRegion = computed(() => {
    const r = this.draft._nrc.regionNo;
    return r ? (NRC_TOWNSHIPS[r] ?? []) : [];
  });

  readonly nrcPreview = computed(() => {
    return buildNrcString(
      this.draft._nrc.regionNo,
      this.draft._nrc.townshipCode,
      this.draft._nrc.citizenType,
      this.draft._nrc.serialNo,
    );
  });

  /* ── Lifecycle ──────────────────────────────────────────────────────── */
  constructor() {
    void this.reload();
  }

  /* ── Data loading ───────────────────────────────────────────────────── */
  async reload(): Promise<void> {
    if (!this.canView()) return;
    try {
      const fromApi = await this.api.getAll().catch(() => [] as EmployeeDto[]);
      // Merge API data; if empty (dev / no backend) fall back to dummy data
      this.employees.set(fromApi.length > 0 ? fromApi : DUMMY_EMPLOYEES);
    } catch {
      this.employees.set(DUMMY_EMPLOYEES);
    }
  }

  /* ── Form helpers ───────────────────────────────────────────────────── */
  isValidDraft(): boolean {
    return !!this.draft.firstName?.trim()
      && !!this.draft.lastName?.trim()
      && !!this.draft.email?.trim()
      && !!this.draft.phoneNo?.trim();
  }

  toggleNewForm(): void {
    if (this.showNewForm()) {
      this.closeForm();
    } else {
      this.resetDraft();
      this.showNewForm.set(true);
    }
  }

  closeForm(): void {
    this.showNewForm.set(false);
    this.resetDraft();
  }

  resetDraft(): void {
    this.editingId.set(null);
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
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email,
      phoneNo: e.phoneNo,
      address: e.address ?? '',
      position: e.position ?? '',
      hireDate: e.hireDate ?? '',
      dateOfBirth: e.dateOfBirth ?? '',
      salary: e.salary ?? '',
      nrc: e.nrc ?? '',
      profilePicUrl: e.profilePicUrl ?? '',
      _nrc: nrcParts,
    };
    this.showNewForm.set(true);
  }

  editFromView(e: EmployeeDto): void {
    this.closeView();
    this.edit(e);
  }

  async save(): Promise<void> {
    if (!this.canManage() || !this.isValidDraft()) return;
    this.saving.set(true);
    try {
      const payload: EmployeeRequest = {
        firstName: this.draft.firstName.trim(),
        lastName: this.draft.lastName.trim(),
        email: this.draft.email.trim(),
        phoneNo: this.draft.phoneNo.trim(),
        address: this.draft.address?.trim(),
        position: this.draft.position?.trim(),
        hireDate: this.draft.hireDate,
        dateOfBirth: this.draft.dateOfBirth,
        salary: this.draft.salary,
        profilePicUrl: this.draft.profilePicUrl?.trim(),
        nrc: this.nrcPreview() || this.draft.nrc?.trim(),
      };
      const id = this.editingId();
      if (id) {
        await this.api.update(id, payload);
        this.toast.success('Employee updated');
      } else {
        await this.api.create(payload);
        this.toast.success('Employee created');
      }
      await this.reload();
      this.closeForm();
    } catch (e) {
      this.toast.error(this.errMsg(e));
    } finally {
      this.saving.set(false);
    }
  }

  async remove(id: number): Promise<void> {
    if (!this.canManage()) return;
    if (!confirm('Delete this employee?')) return;
    this.saving.set(true);
    try {
      await this.api.delete(id);
      this.toast.success('Employee deleted');
      await this.reload();
      if (this.editingId() === id) this.closeForm();
    } catch (e) {
      this.toast.error(this.errMsg(e));
    } finally {
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
      ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Position', 'NRC', 'Hire Date', 'Salary'],
      ...this.filteredEmployees().map(e => [
        e.id, e.firstName, e.lastName, e.email, e.phoneNo,
        e.position ?? '', e.nrc ?? '', e.hireDate ?? '', e.salary ?? '',
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
    return avatarUrl(`${e.firstName} ${e.lastName}`);
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

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.viewingEmployee()) this.closeView();
    else if (this.showNewForm()) this.closeForm();
  }
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
