import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'dashboard/configurations/roles/:roleId/permissions',
    renderMode: RenderMode.Server
  },
  {
    path: 'dashboard/users/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'dashboard/users/:id/edit',
    renderMode: RenderMode.Server
  },
  {
    path: 'dashboard/system/audit-logs',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
