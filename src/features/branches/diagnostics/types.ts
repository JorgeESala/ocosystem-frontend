export interface DiagnosticItemDTO {
  id: number;
  branchId: number;
  branchName: string;
  level: string;
  event: string | null;
  message: string | null;
  context: Record<string, unknown> | null;
  appVersion: string | null;
  occurredAt: string;
  lastSeenAt: string;
  occurrences: number;
  receivedAt: string;
}

export interface DiagnosticDetailDTO extends DiagnosticItemDTO {
  stacktrace: string | null;
}

export interface DiagnosticPageDTO {
  content: DiagnosticItemDTO[];
  page: number;
  size: number;
  totalElements: number;
}

export interface DiagnosticFilters {
  branchId?: number;
  level?: string;
  from: string;
  to: string;
  page?: number;
  size?: number;
}
