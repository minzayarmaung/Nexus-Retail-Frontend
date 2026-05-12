import { Component, Input } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import type { StockStatusSummary } from '../../../../core/dashboard/dashboard.models';

@Component({
  selector: 'app-stock-status-widget',
  imports: [ChartComponent],
  template: `
    <apx-chart
      [series]="series"
      [chart]="chart"
      [labels]="labels"
      [colors]="colors"
      [theme]="theme"
      [legend]="legend"
      [stroke]="stroke"
    />
  `
})
export class StockStatusWidgetComponent {
  @Input() summary: StockStatusSummary = { inStock: 0, lowStock: 0, outOfStock: 0 };
  @Input() darkMode = false;

  get series() {
    return [this.summary.inStock, this.summary.lowStock, this.summary.outOfStock];
  }

  readonly labels = ['In Stock', 'Low Stock', 'Out of Stock'];
  readonly chart = { type: 'donut' as const, height: 250 };
  readonly stroke = { width: 0 };
  readonly legend = { position: 'bottom' as const };

  get colors() {
    return this.darkMode
      ? ['#22c55e', '#f59e0b', '#ef4444']
      : ['#16a34a', '#d97706', '#dc2626'];
  }

  get theme() {
    return { mode: this.darkMode ? 'dark' as const : 'light' as const };
  }
}

