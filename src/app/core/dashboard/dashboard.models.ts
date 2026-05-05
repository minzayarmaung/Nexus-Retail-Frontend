export interface SalesTrendPoint {
  label: string;
  value: number;
}

export interface RevenueByStoreItem {
  store: string;
  value: number;
}

export interface TopProductItem {
  product: string;
  value: number;
}

export interface StockStatusSummary {
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export interface TaskItem {
  id: string;
  title: string;
  owner: string;
  dueAt: string;
  status: 'pending' | 'in_progress' | 'blocked';
}

export interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  postedAt: string;
}

