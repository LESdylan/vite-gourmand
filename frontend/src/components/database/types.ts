/**
 * Database Types - PostgreSQL/Supabase tables
 * Types are dynamic - schema comes from backend Prisma DMMF
 */

export interface TableColumn {
  name: string;
  type: string;
  nullable?: boolean;
  isPrimary?: boolean;
}

export interface TableRecord {
  id: number;
  [key: string]: unknown;
}

export interface TableMeta {
  name: string;
  columns: TableColumn[];
  rowCount: number;
}

export interface FilterConfig {
  column: string;
  operator: 'eq' | 'contains' | 'gt' | 'lt' | 'between';
  value: string | number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface DatabaseState {
  tables: TableMeta[];
  activeTable: string | null;
  records: TableRecord[];
  filters: FilterConfig[];
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
}
