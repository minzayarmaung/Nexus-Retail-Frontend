import { Component } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { NavHubComponent, type NavHubCard } from './nav-hub.component';

@Component({
  selector: 'app-configurations-hub',
  imports: [NavHubComponent, TranslatePipe],
  template: `
    <app-nav-hub
      [title]="'menu.settings' | translate"
      subtitleKey="hub.configurationsSubtitle"
      [items]="cards"
    />
  `,
})
export class ConfigurationsHubComponent {
  readonly cards: NavHubCard[] = [
    {
      path: ['configurations', 'manage-codes'],
      labelKey: 'menu.manageCodes',
      descriptionKey: 'hub.manageCodesDesc',
      icon: 'cog',
    },
    {
      path: ['configurations', 'roles'],
      plainLabel: 'Roles & Permissions',
      descriptionKey: 'hub.rolesDesc',
      icon: 'shield',
    },
  ];
}
