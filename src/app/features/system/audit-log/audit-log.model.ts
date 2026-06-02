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
  actionName?: string;
  actionMethod?: string;
  apiUrl?: string;
  browserName?: string;
  commandAsJson?: string;
  deviceModel?: string;
  entityName?: string;
  entityId?: number | string | null;
  errorMessage?: string | null;
  ipAddress?: string;
  madeOnDate?: string;
  made_on_date?: string;
  makerId?: number | string | null;
  makerName?: string;
  operatingSystem?: string;
  operatingSystemVersion?: string;
  processingResult?: string;
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
  actionName: string;
  actionMethod: string;
  apiUrl: string;
  entityName: string;
  entityId: string;
  makerName: string;
  makerId: string;
  processingResult: string;
  errorMessage: string;
  ipAddress: string;
  browserName: string;
  deviceModel: string;
  operatingSystem: string;
  operatingSystemVersion: string;
  commandAsJson: string;
}

export function mapAuditLogDto(dto: AuditLogDto): AuditLogRow {
  return {
    id: formatAuditCell(dto.id),
    madeOn: dto.madeOnDate ?? dto.made_on_date ?? '',
    actionName: formatAuditCell(dto.actionName ?? dto.action),
    actionMethod: formatAuditCell(dto.actionMethod),
    apiUrl: formatAuditCell(dto.apiUrl),
    entityName: formatAuditCell(dto.entityName),
    entityId: formatAuditCell(dto.entityId),
    makerName: formatAuditCell(dto.makerName),
    makerId: formatAuditCell(dto.makerId),
    processingResult: formatAuditCell(dto.processingResult),
    errorMessage: formatAuditCell(dto.errorMessage),
    ipAddress: formatAuditCell(dto.ipAddress),
    browserName: formatAuditCell(dto.browserName),
    deviceModel: formatAuditCell(dto.deviceModel),
    operatingSystem: formatAuditCell(dto.operatingSystem),
    operatingSystemVersion: formatAuditCell(dto.operatingSystemVersion),
    commandAsJson: formatAuditCell(dto.commandAsJson),
  };
}

export function formatAuditCell(value: unknown): string {
  if (value == null || value === '') return '—';
  return String(value);
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
