import { Component, inject } from '@angular/core';
import type { ToastVariant } from './toast.model';
import { ToastService } from './toast.service';

const toastBase =
  'toast-item flex gap-3 rounded-xl border border-slate-200/90 bg-white/95 py-3.5 pl-3.5 pr-3 shadow-md shadow-slate-900/8 ring-1 ring-slate-900/5 backdrop-blur-sm border-l-4';

const variantBorder: Record<ToastVariant, string> = {
  info: 'border-l-slate-500',
  success: 'border-l-emerald-500',
  warning: 'border-l-amber-500',
  error: 'border-l-rose-500'
};

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css'
})
export class ToastContainerComponent {
  protected readonly toast = inject(ToastService);

  protected itemClass(variant: ToastVariant): string {
    return `${toastBase} ${variantBorder[variant]}`;
  }
}
