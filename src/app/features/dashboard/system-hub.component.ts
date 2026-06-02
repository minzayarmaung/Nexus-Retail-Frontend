import { Component } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { NavHubComponent, type NavHubCard } from './nav-hub.component';

@Component({
  selector: 'app-system-hub',
  imports: [NavHubComponent, TranslatePipe],
  template: `
    <app-nav-hub
      [title]="'menu.system' | translate"
      subtitleKey="hub.systemSubtitle"
      [items]="cards"
    />
  `,
})
export class SystemHubComponent {
  readonly cards: NavHubCard[] = [
    {
      path: ['system', 'audit'],
      labelKey: 'menu.audit',
      descriptionKey: 'hub.auditLogDesc',
      icon: 'shield',
    },
  ];
}
