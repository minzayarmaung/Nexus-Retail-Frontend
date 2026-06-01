export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first?: boolean;
  last?: boolean;
}

/** Backend audit log row — supports camelCase and snake_case. */
export interface AuditLogDto {
  id?: number | string;
  action?: string;
  entityName?: string;
  entityId?: number | string;
  makerName?: string;
  processingResult?: string;
  madeOnDate?: string;
  made_on_date?: string;
  actionMethod?: string;
  browserName?: string;
  deviceModel?: string;
  operatingSystem?: string;
  operatingSystemVersion?: string;
}

export interface AuditSearchFilters {
  action?: string;
  entityName?: string;
  entityId?: string;
  makerName?: string;
  processingResult?: string;
  from?: string;
  to?: string;
  actionMethod?: string;
  browserName?: string;
  deviceModel?: string;
  operatingSystem?: string;
  operatingSystemVersion?: string;
}

export interface AuditLogRow {
  id: string;
  madeOn: string;
  action: string;
  makerName: string;
  entityLabel: string;
  processingResult: string;
  actionMethod: string;
}

export function mapAuditLogDto(dto: AuditLogDto): AuditLogRow {
  const madeOn = dto.madeOnDate ?? dto.made_on_date ?? '';
  const entityParts = [dto.entityName, dto.entityId != null ? String(dto.entityId) : ''].filter(Boolean);
  return {
    id: dto.id != null ? String(dto.id) : '',
    madeOn,
    action: dto.action ?? '—',
    makerName: dto.makerName ?? '—',
    entityLabel: entityParts.length ? entityParts.join(' #') : '—',
    processingResult: dto.processingResult ?? '—',
    actionMethod: dto.actionMethod ?? '—',
  };
}

export function formatAuditDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function toInstantParam(localDatetime: string): string | undefined {
  if (!localDatetime?.trim()) return undefined;
  const d = new Date(localDatetime);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}
