/**
 * Database Service - Real CRUD operations for PostgreSQL/Supabase tables
 * Connects to the backend CRUD API (/api/crud/*)
 * Schema is fetched dynamically from the backend (Prisma DMMF)
 */

import { apiRequest } from '../../services/api';
import type { TableRecord, TableMeta, FilterConfig, PaginationState } from './types';

const BASE = '/api/crud';

/** Map model names to API endpoints (only tables with CRUD routes) */
const MODEL_TO_ENDPOINT: Record<string, string> = {
  User: 'users',
  Role: 'roles',
  Order: 'orders',
  Menu: 'menus',
  Diet: 'diets',
  Theme: 'themes',
  Dish: 'dishes',
  Allergen: 'allergens',
  WorkingHours: 'working-hours',
};

/** Schema column from backend */
interface SchemaColumn {
  name: string;
  type: string;
  isId?: boolean;
  isRequired?: boolean;
  isList?: boolean;
  isRelation?: boolean;
}

/** Schema model from backend */
interface SchemaModel {
  name: string;
  columns: SchemaColumn[];
}

export class DatabaseService {
  /** Fetch database schema from backend (Prisma DMMF) */
  static async getSchema(): Promise<SchemaModel[]> {
    try {
      console.log('[DatabaseService] Fetching schema from', `${BASE}/schema`);
      const response = await apiRequest(`${BASE}/schema`) as { data?: SchemaModel[] } | SchemaModel[];
      console.log('[DatabaseService] Raw schema response:', response);
      
      // Handle wrapped response { success, data } or direct array
      if (Array.isArray(response)) {
        console.log('[DatabaseService] Response is array with', response.length, 'items');
        return response;
      }
      const data = response.data || [];
      console.log('[DatabaseService] Extracted data with', data.length, 'items');
      return data;
    } catch (error) {
      console.error('[DatabaseService] Failed to fetch schema:', error);
      return [];
    }
  }

  /** Fetch row counts for all tables */
  static async getCounts(): Promise<Record<string, number>> {
    try {
      console.log('[DatabaseService] Fetching counts from', `${BASE}/counts`);
      const response = await apiRequest(`${BASE}/counts`) as { data?: Record<string, number> } | Record<string, number>;
      console.log('[DatabaseService] Raw counts response:', response);
      
      // Handle wrapped response { success, data } or direct object
      if (response && typeof response === 'object' && 'data' in response) {
        return (response.data || {}) as Record<string, number>;
      }
      return response as Record<string, number>;
    } catch (error) {
      console.error('[DatabaseService] Failed to fetch counts:', error);
      return {};
    }
  }

  /** Convert schema to TableMeta format with real counts */
  static async getTables(): Promise<TableMeta[]> {
    // Fetch schema and counts in parallel
    const [schema, counts] = await Promise.all([
      this.getSchema(),
      this.getCounts(),
    ]);
    console.log('[DatabaseService] Schema loaded:', schema.length, 'tables');
    console.log('[DatabaseService] Counts loaded:', counts);
    
    const tables = schema
      .filter(model => MODEL_TO_ENDPOINT[model.name]) // Only include models with endpoints
      .map(model => ({
        name: model.name as TableMeta['name'],
        columns: model.columns
          .filter(col => !col.isRelation && !col.isList) // Exclude relations
          .map(col => ({
            name: col.name,
            type: col.type.toLowerCase(),
            nullable: !col.isRequired,
            isPrimary: col.isId ?? false,
          })),
        rowCount: counts[model.name] || 0,
      }));
    
    console.log('[DatabaseService] Tables with endpoints:', tables.map(t => `${t.name}(${t.rowCount})`));
    return tables;
  }

  /** Fetch records with filters and pagination from real CRUD API */
  static async getRecords(
    table: string,
    filters: FilterConfig[],
    pagination: PaginationState
  ): Promise<{ data: TableRecord[]; total: number }> {
    const endpoint = MODEL_TO_ENDPOINT[table];
    if (!endpoint) {
      console.warn(`No endpoint for table: ${table}`);
      return { data: [], total: 0 };
    }

    const params = this.buildQueryParams(filters, pagination);
    const url = `${BASE}/${endpoint}${params ? `?${params}` : ''}`;

    try {
      const response = await apiRequest(url) as unknown;
      console.log(`[DatabaseService] Response for ${table}:`, response);
      
      // Handle various response formats:
      // 1. Wrapped: { success, data: { data: [], total } }
      // 2. Wrapped array: { success, data: [] }
      // 3. Direct paginated: { data: [], total }
      // 4. Direct array: []
      
      if (Array.isArray(response)) {
        return { data: response as TableRecord[], total: response.length };
      }
      
      const res = response as { data?: unknown; total?: number };
      
      // Check if data is the inner paginated object
      if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
        const inner = res.data as { data?: TableRecord[]; total?: number };
        if (inner.data) {
          return { data: inner.data, total: inner.total || inner.data.length };
        }
      }
      
      // Check if data is an array directly
      if (Array.isArray(res.data)) {
        return { data: res.data as TableRecord[], total: res.total || res.data.length };
      }
      
      return { data: [], total: 0 };
    } catch (error) {
      console.error(`Error fetching ${table}:`, error);
      return { data: [], total: 0 };
    }
  }

  /** Create a new record */
  static async create(table: string, data: Partial<TableRecord>): Promise<TableRecord> {
    const endpoint = MODEL_TO_ENDPOINT[table];
    return apiRequest(`${BASE}/${endpoint}`, { method: 'POST', body: data }) as Promise<TableRecord>;
  }

  /** Update an existing record */
  static async update(table: string, id: number, data: Partial<TableRecord>): Promise<TableRecord> {
    const endpoint = MODEL_TO_ENDPOINT[table];
    return apiRequest(`${BASE}/${endpoint}/${id}`, { method: 'PUT', body: data }) as Promise<TableRecord>;
  }

  /** Delete a record */
  static async delete(table: string, id: number): Promise<void> {
    await apiRequest(`${MODEL_TO_ENDPOINT[table] ? `${BASE}/${MODEL_TO_ENDPOINT[table]}/${id}` : ''}`, { method: 'DELETE' });
  }

  /** Build query string from filters and pagination */
  private static buildQueryParams(filters: FilterConfig[], { page, pageSize }: PaginationState): string {
    const params = new URLSearchParams();
    params.set('skip', String((page - 1) * pageSize));
    params.set('take', String(pageSize));
    
    // Build search param from contains filters
    const searchFilter = filters.find(f => f.operator === 'contains');
    if (searchFilter) {
      params.set('search', String(searchFilter.value));
    }
    
    return params.toString();
  }

  // ============================================================
  // SCHEMA MODIFICATION - Create tables and columns
  // ============================================================

  /** Create a new table with columns */
  static async createTable(
    tableName: string,
    columns: Array<{
      name: string;
      type: string;
      nullable: boolean;
      defaultValue?: string | null;
      isPrimary?: boolean;
      isUnique?: boolean;
      foreignKey?: { table: string; column: string } | null;
    }>
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('[DatabaseService] Creating table:', tableName, columns);
      const response = await apiRequest(`${BASE}/schema/table`, {
        method: 'POST',
        body: { tableName, columns },
      }) as { success: boolean; message: string };
      console.log('[DatabaseService] Create table response:', response);
      return response;
    } catch (error) {
      console.error('[DatabaseService] Failed to create table:', error);
      throw error;
    }
  }

  /** Add a column to an existing table */
  static async addColumn(
    tableName: string,
    column: {
      name: string;
      type: string;
      nullable: boolean;
      defaultValue?: string | null;
      isUnique?: boolean;
      foreignKey?: { table: string; column: string } | null;
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('[DatabaseService] Adding column to', tableName, ':', column);
      const response = await apiRequest(`${BASE}/schema/column`, {
        method: 'POST',
        body: { tableName, column },
      }) as { success: boolean; message: string };
      console.log('[DatabaseService] Add column response:', response);
      return response;
    } catch (error) {
      console.error('[DatabaseService] Failed to add column:', error);
      throw error;
    }
  }

  /** Get all tables from PostgreSQL (including dynamically created) */
  static async getAllTables(): Promise<string[]> {
    try {
      const response = await apiRequest(`${BASE}/schema/tables`) as string[] | { data: string[] };
      if (Array.isArray(response)) {
        return response;
      }
      return response.data || [];
    } catch (error) {
      console.error('[DatabaseService] Failed to get all tables:', error);
      return [];
    }
  }

  /** Get full database schema from PostgreSQL */
  static async getFullSchema(): Promise<Array<{
    name: string;
    columns: Array<{
      name: string;
      type: string;
      isNullable: boolean;
      defaultValue: string | null;
      isPrimaryKey: boolean;
    }>;
  }>> {
    type FullSchemaResult = Array<{
      name: string;
      columns: Array<{
        name: string;
        type: string;
        isNullable: boolean;
        defaultValue: string | null;
        isPrimaryKey: boolean;
      }>;
    }>;
    try {
      const response = await apiRequest(`${BASE}/schema/full`);
      if (Array.isArray(response)) {
        return response as FullSchemaResult;
      }
      return ((response as { data?: FullSchemaResult }).data || []);
    } catch (error) {
      console.error('[DatabaseService] Failed to get full schema:', error);
      return [];
    }
  }

  /** Get foreign key relationships */
  static async getForeignKeys(): Promise<Array<{
    tableName: string;
    columnName: string;
    referencedTable: string;
    referencedColumn: string;
  }>> {
    type ForeignKeyResult = Array<{
      tableName: string;
      columnName: string;
      referencedTable: string;
      referencedColumn: string;
    }>;
    try {
      const response = await apiRequest(`${BASE}/schema/foreign-keys`);
      if (Array.isArray(response)) {
        return response as ForeignKeyResult;
      }
      return ((response as { data?: ForeignKeyResult }).data || []);
    } catch (error) {
      console.error('[DatabaseService] Failed to get foreign keys:', error);
      return [];
    }
  }
}
