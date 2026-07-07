import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../directives/click-outside.directive';
import { ServerConfigService, type ServerConfig } from '../../core/server/server-config.service';

@Component({
  selector: 'app-server-switch',
  imports: [FormsModule, ClickOutsideDirective],
  templateUrl: './server-switch.component.html',
  styleUrl: './server-switch.component.css'
})
export class ServerSwitchComponent {
  private readonly serverConfig = inject(ServerConfigService);
  
  readonly isOpen = signal(false);
  readonly servers = this.serverConfig.servers;
  readonly selectedServer = this.serverConfig.selectedServer;
  
  readonly newServerName = signal('');
  readonly newServerUrl = signal('');
  readonly showAddForm = signal(false);
  
  toggleDropdown(): void {
    this.isOpen.update(open => !open);
  }
  
  closeDropdown(): void {
    this.isOpen.set(false);
    this.showAddForm.set(false);
  }
  
  selectServer(server: ServerConfig): void {
    this.serverConfig.selectServer(server.id);
    this.closeDropdown();
  }
  
  showAddServerForm(): void {
    this.showAddForm.set(true);
    this.newServerName.set('');
    this.newServerUrl.set('');
  }
  
  hideAddServerForm(): void {
    this.showAddForm.set(false);
    this.newServerName.set('');
    this.newServerUrl.set('');
  }
  
  addServer(): void {
    const name = this.newServerName().trim();
    const url = this.newServerUrl().trim();
    
    if (!name || !url) {
      return;
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch {
      return;
    }
    
    this.serverConfig.addServer(name, url);
    this.hideAddServerForm();
  }
  
  removeServer(event: Event, server: ServerConfig): void {
    event.stopPropagation();
    if (server.isDefault) {
      return;
    }
    this.serverConfig.removeServer(server.id);
  }
}
