/** Human-readable role label, e.g. ROLE_SYSTEM_ADMIN → System Admin */
export function formatRoleLabel(roleName: string): string {
  return roleName
    .trim()
    .replace(/^ROLE_/i, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatRolesList(roles: string[] | null | undefined): string {
  if (!roles?.length) return '—';
  return roles.map(formatRoleLabel).join(', ');
}
