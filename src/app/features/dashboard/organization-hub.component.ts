import { Component } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { NavHubComponent, type NavHubCard } from './nav-hub.component';

@Component({
  selector: 'app-organization-hub',
  imports: [NavHubComponent, TranslatePipe],
  template: `
    <app-nav-hub
      [title]="'menu.organization' | translate"
      subtitleKey="hub.organizationSubtitle"
      [items]="cards"
    />
  `,
})
export class OrganizationHubComponent {
  readonly cards: NavHubCard[] = [
    {
      path: ['organization', 'password-preferences'],
      labelKey: 'menu.passwordPreferences',
      plainLabel: 'Password Preferences',
      descriptionKey: 'hub.passwordPreferencesDesc',
      icon: 'lock',
    },
  ];
}
