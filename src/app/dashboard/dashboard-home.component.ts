import { Component, computed, effect, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { GridStack } from 'gridstack';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { DashboardDataService } from '../core/dashboard/dashboard-data.service';
import type { DashboardLayoutState, DashboardWidgetId } from '../core/dashboard/dashboard-layout.models';
import { SessionService } from '../core/user/session.service';
import { DashboardLayoutService } from '../core/dashboard/dashboard-layout.service';
import { ThemeService } from '../core/theme/theme.service';
import { DashboardCustomizeBarComponent } from './widgets/dashboard-customize-bar.component';
import { DashboardWidgetShellComponent } from './widgets/dashboard-widget-shell.component';
import { widgetDef } from './widgets/widgets.registry';
import { SalesTrendWidgetComponent } from './widgets/charts/sales-trend-widget.component';
import { RevenueByStoreWidgetComponent } from './widgets/charts/revenue-by-store-widget.component';
import { TopProductsWidgetComponent } from './widgets/charts/top-products-widget.component';
import { StockStatusWidgetComponent } from './widgets/charts/stock-status-widget.component';
import { TasksWidgetComponent } from './widgets/misc/tasks-widget.component';
import { AnnouncementsWidgetComponent } from './widgets/misc/announcements-widget.component';
import type { AnnouncementItem, RevenueByStoreItem, SalesTrendPoint, StockStatusSummary, TaskItem, TopProductItem } from '../core/dashboard/dashboard.models';

@Component({
  selector: 'app-dashboard-home',
  imports: [
    TranslatePipe,
    DashboardCustomizeBarComponent,
    DashboardWidgetShellComponent,
    SalesTrendWidgetComponent,
    RevenueByStoreWidgetComponent,
    TopProductsWidgetComponent,
    StockStatusWidgetComponent,
    TasksWidgetComponent,
    AnnouncementsWidgetComponent
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css'
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  private readonly session = inject(SessionService);
  private readonly layoutService = inject(DashboardLayoutService);
  private readonly dataService = inject(DashboardDataService);
  private readonly theme = inject(ThemeService);

  @ViewChild('gridRoot') private gridRoot?: ElementRef<HTMLElement>;

  protected readonly user = this.session.user;
  protected readonly customizing = signal(false);
  protected readonly layout = signal<DashboardLayoutState | null>(null);
  protected readonly salesTrend = signal<SalesTrendPoint[]>([]);
  protected readonly revenueByStore = signal<RevenueByStoreItem[]>([]);
  protected readonly topProducts = signal<TopProductItem[]>([]);
  protected readonly stockStatus = signal<StockStatusSummary>({ inStock: 0, lowStock: 0, outOfStock: 0 });
  protected readonly tasks = signal<TaskItem[]>([]);
  protected readonly announcements = signal<AnnouncementItem[]>([]);

  protected readonly darkMode = computed(() => this.theme.mode() === 'dark');

  protected readonly visibleItems = computed(() => {
    const state = this.layout();
    const role = this.user()?.role;
    if (!state || !role) return [];
    return state.items.filter((item) => !item.hidden && widgetDef(item.id).roles.includes(role));
  });

  private grid?: GridStack;
  private reinitTimer: ReturnType<typeof setTimeout> | null = null;
  private syncing = false;

  constructor() {
    effect(() => {
      const u = this.user();
      if (!u) {
        this.layout.set(null);
        return;
      }
      this.layout.set(this.layoutService.load(u.id, u.role));
      this.scheduleGridInit();
    });
  }

  ngOnInit(): void {
    void this.loadWidgetData();
  }

  ngOnDestroy(): void {
    if (this.reinitTimer) {
      clearTimeout(this.reinitTimer);
      this.reinitTimer = null;
    }
    this.grid?.destroy(false);
    this.grid = undefined;
  }

  protected widgetTitle(id: DashboardWidgetId): string {
    return widgetDef(id).title;
  }

  protected widgetSubtitle(id: DashboardWidgetId): string | undefined {
    return widgetDef(id).subtitle;
  }

  protected toggleCustomize(): void {
    this.customizing.update((v) => !v);
    this.grid?.setStatic(!this.customizing());
  }

  protected resetLayout(): void {
    const u = this.user();
    if (!u) return;
    this.layout.set(this.layoutService.resetToDefault(u.id, u.role));
    this.scheduleGridInit();
  }

  protected hideWidget(id: DashboardWidgetId): void {
    this.layout.update((state) => {
      if (!state) return state;
      return {
        ...state,
        items: state.items.map((item) => (item.id === id ? { ...item, hidden: true } : item))
      };
    });
    this.persistLayout();
    this.scheduleGridInit();
  }

  protected trackWidget(_: number, item: { id: DashboardWidgetId }): DashboardWidgetId {
    return item.id;
  }

  protected i18nPrefix(): string {
    const role = this.user()?.role;
    return role ? `dashboard.${role}.` : 'dashboard.system_admin.';
  }

  private scheduleGridInit(): void {
    if (this.reinitTimer) clearTimeout(this.reinitTimer);
    this.reinitTimer = setTimeout(() => {
      this.reinitTimer = null;
      this.initGrid();
    }, 0);
  }

  private initGrid(): void {
    const host = this.gridRoot?.nativeElement;
    if (!host) return;

    this.grid?.destroy(false);
    this.grid = GridStack.init(
      {
        column: 12,
        margin: 8,
        cellHeight: 96,
        float: true,
        draggable: { handle: '.gridstack-drag-handle' },
        staticGrid: !this.customizing()
      },
      host
    );

    this.grid.on('change', (_event, nodes) => this.persistFromNodes(nodes));
    this.grid.on('resizestop', () => this.persistCurrentFromGrid());
  }

  private persistFromNodes(nodes: { id?: string | number; x?: number; y?: number; w?: number; h?: number }[]): void {
    if (this.syncing || !nodes?.length) return;
    this.syncing = true;
    this.layout.update((state) => {
      if (!state) return state;
      const map = new Map(state.items.map((item) => [item.id, { ...item }]));
      for (const node of nodes) {
        const id = String(node.id ?? '') as DashboardWidgetId;
        const current = map.get(id);
        if (!current) continue;
        current.x = node.x ?? current.x;
        current.y = node.y ?? current.y;
        current.w = node.w ?? current.w;
        current.h = node.h ?? current.h;
      }
      return { ...state, items: [...map.values()] };
    });
    this.persistLayout();
    this.syncing = false;
  }

  private persistCurrentFromGrid(): void {
    const nodes = this.grid?.engine.nodes ?? [];
    this.persistFromNodes(nodes);
  }

  private persistLayout(): void {
    const state = this.layout();
    const u = this.user();
    if (!state || !u) return;
    this.layoutService.save(u.id, u.role, state);
  }

  private async loadWidgetData(): Promise<void> {
    const [salesTrend, revenueByStore, topProducts, stockStatus, tasks, announcements] = await Promise.all([
      this.dataService.getSalesTrend(),
      this.dataService.getRevenueByStore(),
      this.dataService.getTopProducts(),
      this.dataService.getStockStatus(),
      this.dataService.getTasks(),
      this.dataService.getAnnouncements()
    ]);
    this.salesTrend.set(salesTrend);
    this.revenueByStore.set(revenueByStore);
    this.topProducts.set(topProducts);
    this.stockStatus.set(stockStatus);
    this.tasks.set(tasks);
    this.announcements.set(announcements);
  }
}
