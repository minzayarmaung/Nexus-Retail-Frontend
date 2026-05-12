import { Component, Input } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import type { TopProductItem } from '../../../../core/dashboard/dashboard.models';

@Component({
  selector: 'app-top-products-widget',
  imports: [ChartComponent],
  template: `
    <apx-chart
      [series]="series"
      [chart]="chart"
      [plotOptions]="plotOptions"
      [xaxis]="xaxis"
      [grid]="grid"
      [theme]="theme"
      [colors]="colors"
      [dataLabels]="dataLabels"
    />
  `
})
export class TopProductsWidgetComponent {
  @Input() items: TopProductItem[] = [];
  @Input() darkMode = false;

  get series() {
    return [{ name: 'Revenue', data: this.items.map((i) => i.value) }];
  }

  readonly chart = { type: 'bar' as const, height: 260, toolbar: { show: false } };
  readonly plotOptions = { bar: { horizontal: true, borderRadius: 4, barHeight: '55%' } };
  readonly dataLabels = { enabled: false };

  get xaxis() {
    return {
      categories: this.items.map((i) => i.product),
      labels: { style: { colors: this.darkMode ? '#94a3b8' : '#475569' } }
    };
  }

  get grid() {
    return { borderColor: this.darkMode ? '#334155' : '#e2e8f0' };
  }

  get theme() {
    return { mode: this.darkMode ? 'dark' as const : 'light' as const };
  }

  get colors() {
    return [this.darkMode ? '#f59e0b' : '#d97706'];
  }
}

