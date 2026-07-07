import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

export interface ServerConfig {
  id: string;
  name: string;
  url: string;
  isDefault?: boolean;
}

const STORAGE_KEY = 'nexus-server-configs';
const DEFAULT_SERVERS: ServerConfig[] = [
  {
    id: 'default',
    name: 'Local Server',
    url: 'http://localhost:8080',
    isDefault: true,
  },
];

@Injectable({ providedIn: 'root' })
export class ServerConfigService {
  private readonly platformId = inject(PLATFORM_ID);
  
  private readonly _servers = signal<ServerConfig[]>(DEFAULT_SERVERS);
  private readonly _selectedServerId = signal<string>('default');
  
  readonly servers = this._servers.asReadonly();
  readonly selectedServerId = this._selectedServerId.asReadonly();
  readonly selectedServer = computed(() => 
    this._servers().find(s => s.id === this._selectedServerId()) || DEFAULT_SERVERS[0]
  );

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this._servers.set(parsed);
        }
      }
      
      const selectedId = localStorage.getItem(`${STORAGE_KEY}-selected`);
      if (selectedId) {
        this._selectedServerId.set(selectedId);
      }
    } catch {
      // Use defaults if storage fails
    }
  }

  private saveToStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._servers()));
      localStorage.setItem(`${STORAGE_KEY}-selected`, this._selectedServerId());
    } catch {
      // Ignore storage errors
    }
  }

  selectServer(id: string): void {
    const server = this._servers().find(s => s.id === id);
    if (server) {
      this._selectedServerId.set(id);
      this.saveToStorage();
    }
  }

  addServer(name: string, url: string): ServerConfig {
    const id = `server-${Date.now()}`;
    const newServer: ServerConfig = { id, name, url };
    this._servers.update(servers => [...servers, newServer]);
    this.saveToStorage();
    return newServer;
  }

  removeServer(id: string): void {
    if (id === 'default') {
      return; // Don't remove default server
    }
    
    this._servers.update(servers => servers.filter(s => s.id !== id));
    
    // If removed server was selected, select default
    if (this._selectedServerId() === id) {
      this._selectedServerId.set('default');
    }
    
    this.saveToStorage();
  }

  updateServer(id: string, updates: Partial<Omit<ServerConfig, 'id'>>): void {
    this._servers.update(servers => 
      servers.map(s => s.id === id ? { ...s, ...updates } : s)
    );
    this.saveToStorage();
  }

  getServerUrl(): string {
    return this.selectedServer()?.url || DEFAULT_SERVERS[0].url;
  }
}
