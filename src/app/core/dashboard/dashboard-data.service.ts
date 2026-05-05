import { Injectable } from '@angular/core';
import type { AnnouncementItem, RevenueByStoreItem, SalesTrendPoint, StockStatusSummary, TaskItem, TopProductItem } from './dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  // API seam: replace these dummy implementations with HttpClient calls later.
  getSalesTrend(): Promise<SalesTrendPoint[]> {
    return Promise.resolve([
      { label: 'Mon', value: 42 },
      { label: 'Tue', value: 55 },
      { label: 'Wed', value: 48 },
      { label: 'Thu', value: 68 },
      { label: 'Fri', value: 73 },
      { label: 'Sat', value: 81 },
      { label: 'Sun', value: 76 }
    ]);
  }

  getRevenueByStore(): Promise<RevenueByStoreItem[]> {
    return Promise.resolve([
      { store: 'Yangon Central', value: 92_000 },
      { store: 'Mandalay North', value: 74_000 },
      { store: 'Naypyidaw Plaza', value: 61_000 },
      { store: 'Bago Town', value: 39_000 }
    ]);
  }

  getTopProducts(): Promise<TopProductItem[]> {
    return Promise.resolve([
      { product: 'Iced Coffee', value: 27_500 },
      { product: 'Cheese Toast', value: 21_000 },
      { product: 'Chicken Wrap', value: 18_900 },
      { product: 'Lemon Tea', value: 15_400 },
      { product: 'Mocha Latte', value: 13_800 }
    ]);
  }

  getStockStatus(): Promise<StockStatusSummary> {
    return Promise.resolve({
      inStock: 418,
      lowStock: 67,
      outOfStock: 19
    });
  }

  getTasks(): Promise<TaskItem[]> {
    return Promise.resolve([
      { id: 'tsk-1', title: 'Approve supplier invoice #2108', owner: 'Finance', dueAt: 'Today 14:00', status: 'pending' },
      { id: 'tsk-2', title: 'Review stock transfer request', owner: 'Store Ops', dueAt: 'Today 16:30', status: 'in_progress' },
      { id: 'tsk-3', title: 'Confirm weekend staffing', owner: 'HR', dueAt: 'Tomorrow 10:00', status: 'blocked' }
    ]);
  }

  getAnnouncements(): Promise<AnnouncementItem[]> {
    return Promise.resolve([
      { id: 'note-1', title: 'Price sync completed', message: 'All branch POS prices were synchronized at 08:30.', postedAt: '08:32' },
      { id: 'note-2', title: 'Delivery delay alert', message: 'Supplier NRG-4 delivery moved to tomorrow morning.', postedAt: 'Yesterday' },
      { id: 'note-3', title: 'Audit reminder', message: 'Monthly stock audit deadline is this Friday.', postedAt: 'Yesterday' }
    ]);
  }
}

