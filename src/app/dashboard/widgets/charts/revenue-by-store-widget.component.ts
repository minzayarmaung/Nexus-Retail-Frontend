import { Component, Input } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import type { RevenueByStoreItem } from '../../../core/dashboard/dashboard.models';

@Component({
  selector: 'app-revenue-by-store-widget',
  imports: [ChartComponent],
  template: `
    <apx-chart
      [series]="series"
      [chart]="chart"
      [plotOptions]="plotOptions"
      [xaxis]="xaxis"
      [yaxis]="yaxis"
      [grid]="grid"
      [theme]="theme"
      [colors]="colors"
      [dataLabels]="dataLabels"
    />
  `
})
export class RevenueByStoreWidgetComponent {
  @Input() items: RevenueByStoreItem[] = [];
  @Input() darkMode = false;

  get series() {
    return [{ name: 'Revenue', data: this.items.map((i) => i.value) }];
  }

  readonly chart = { type: 'bar' as const, height: 260, toolbar: { show: false } };
  readonly plotOptions = { bar: { borderRadius: 4, columnWidth: '48%' } };
  readonly dataLabels = { enabled: false };

  get xaxis() {
    return {
      categories: this.items.map((i) => i.store),
      labels: { style: { colors: this.darkMode ? '#94a3b8' : '#475569' } }
    };
  }

  get yaxis() {
    return {
      labels: {
        style: { colors: this.darkMode ? '#94a3b8' : '#475569' },
        formatter: (val: number) => `${Math.round(val / 1000)}k`
      }
    };
  }

  get grid() {
    return { borderColor: this.darkMode ? '#334155' : '#e2e8f0' };
  }

  get theme() {
    return { mode: this.darkMode ? 'dark' as const : 'light' as const };
  }

  get colors() {
    return [this.darkMode ? '#22c55e' : '#0f766e'];
  }
}

