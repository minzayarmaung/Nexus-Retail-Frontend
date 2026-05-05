import { Component, Input } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import type { SalesTrendPoint } from '../../../core/dashboard/dashboard.models';

@Component({
  selector: 'app-sales-trend-widget',
  imports: [ChartComponent],
  template: `
    <apx-chart
      [series]="series"
      [chart]="chart"
      [stroke]="stroke"
      [xaxis]="xaxis"
      [yaxis]="yaxis"
      [grid]="grid"
      [theme]="theme"
      [colors]="colors"
      [tooltip]="tooltip"
      [dataLabels]="dataLabels"
    />
  `
})
export class SalesTrendWidgetComponent {
  @Input() points: SalesTrendPoint[] = [];
  @Input() darkMode = false;

  get series() {
    return [{ name: 'Sales', data: this.points.map((p) => p.value) }];
  }

  readonly chart = { type: 'line' as const, height: 260, toolbar: { show: false } };
  readonly stroke = { curve: 'smooth' as const, width: 3 };
  readonly tooltip = { theme: 'dark' as const };
  readonly dataLabels = { enabled: false };

  get xaxis() {
    return {
      categories: this.points.map((p) => p.label),
      labels: { style: { colors: this.darkMode ? '#94a3b8' : '#475569' } }
    };
  }

  get yaxis() {
    return { labels: { style: { colors: this.darkMode ? '#94a3b8' : '#475569' } } };
  }

  get grid() {
    return { borderColor: this.darkMode ? '#334155' : '#e2e8f0' };
  }

  get theme() {
    return { mode: this.darkMode ? 'dark' as const : 'light' as const };
  }

  get colors() {
    return [this.darkMode ? '#38bdf8' : '#0f172a'];
  }
}

