/**
 * Database Service — Generic PostgREST-backed CRUD & introspection.
 *
 * Schema discovery uses the OpenAPI spec PostgREST exposes at its root
 * (/rest/v1/).  CRUD goes through @supabase/supabase-js which already
 * handles auth headers, pagination, and the PostgREST query language.
 *
 * This service is intentionally independent of any single application's
 * data model — every public table is discovered dynamically.
 */

import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../lib/supabase';
import type { TableRecord, TableMeta, FilterConfig, PaginationState } from './types';

// ── OpenAPI types (subset of what PostgREST returns at root) ─────

interface OpenApiSpec {
  paths: Record<string, unknown>;
  definitions: Record<
    string,
    {
      required?: string[];
      properties: Record<
        string,
        { type?: string; format?: string; description?: string; enum?: string[] }
      >;
    }
  >;
}

// ── Internal cache (avoids re-fetching the spec on every navigation) ──

let _specCache: OpenApiSpec | null = null;
let _specPromise: Promise<OpenApiSpec> | null = null;

async function fetchOpenApiSpec(): Promise<OpenApiSpec> {
  if (_specCache) return _specCache;
  if (_specPromise) return _specPromise;

  _specPromise = (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
      apikey: SUPABASE_ANON_KEY,
      Accept: 'application/openapi+json',
    };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, { headers });
    if (!res.ok) throw new Error(`OpenAPI spec: ${res.status} ${res.statusText}`);
    _specCache = (await res.json()) as OpenApiSpec;
    return _specCache;
  })();

  return _specPromise;
}

/** Call this after creating / dropping a table to force re-discovery. */
export function invalidateSpecCache(): void {
  _specCache = null;
  _specPromise = null;
}

// ── Helpers ──────────────────────────────────────────────────────

/** Tables / views we never want to expose in the viewer. */
const HIDDEN_TABLES = new Set([
  // PostgREST always exposes the root "/" path — skip it
  '/',
]);

/** Return true for paths that are NOT tables (rpc functions, root). */
function isNonTablePath(path: string): boolean {
  return HIDDEN_TABLES.has(path) || path.startsWith('/rpc/');
}

/** Map a PostgREST (OpenAPI) type+format to a short human label. */
function mapType(type?: string, format?: string): string {
  if (!format) return type ?? 'unknown';
  // PostgREST formats: uuid, text, integer, bigint, boolean,
  // timestamp with time zone, jsonb …
  return format;
}

/** Detect primary key from PostgREST description tag `<pk/>`. */
function isPrimaryKey(description?: string): boolean {
  return !!description && /Primary Key|<pk\s*\/?>/.test(description);
}

/**
 * Find the primary-key column name for a table.
 * Falls back to "id" if no PK annotation is found.
 */
function pkColumn(
  props: Record<string, { description?: string }>,
): string {
  for (const [col, meta] of Object.entries(props)) {
    if (isPrimaryKey(meta.description)) return col;
  }
  return 'id';
}

// ── Public API ───────────────────────────────────────────────────

export class DatabaseService {
  // ────────────────── Schema introspection ──────────────────────

  /** Discover every public table + columns from the PostgREST OpenAPI spec. */
  static async getTables(): Promise<TableMeta[]> {
    const spec = await fetchOpenApiSpec();
    const tableNames = Object.keys(spec.paths).filter((p) => !isNonTablePath(p));

    // Build table metadata from the definitions section
    const tables: TableMeta[] = tableNames.map((path) => {
      const name = path.replace(/^\//, ''); // "/profiles" → "profiles"
      const def = spec.definitions[name];
      if (!def) return { name, columns: [], rowCount: -1 };

      const required = new Set(def.required ?? []);

      const columns = Object.entries(def.properties).map(([colName, colMeta]) => ({
        name: colName,
        type: mapType(colMeta.type, colMeta.format),
        nullable: !required.has(colName),
        isPrimary: isPrimaryKey(colMeta.description),
      }));

      return { name, columns, rowCount: -1 }; // rowCount filled below
    });

    // Fetch row counts in parallel (HEAD + Prefer: count=exact)
    await Promise.allSettled(
      tables.map(async (t) => {
        try {
          const { count } = await supabase
            .from(t.name)
            .select('*', { count: 'exact', head: true });
          t.rowCount = count ?? 0;
        } catch {
          t.rowCount = 0;
        }
      }),
    );

    tables.sort((a, b) => a.name.localeCompare(b.name));

    console.log(
      '[DatabaseService] Discovered',
      tables.length,
      'tables:',
      tables.map((t) => `${t.name}(${t.rowCount})`),
    );
    return tables;
  }

  // ────────────────── Record fetching (read) ────────────────────

  /** Fetch records with PostgREST pagination and filtering. */
  static async getRecords(
    table: string,
    filters: FilterConfig[],
    pagination: PaginationState,
  ): Promise<{ data: TableRecord[]; total: number }> {
    const { page, pageSize } = pagination;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from(table).select('*', { count: 'exact' }).range(from, to);

    // Apply filters (PostgREST operators)
    for (const f of filters) {
      if (f.column === '_search') {
        // Generic search placeholder — the useDatabase hook should convert
        // this into a concrete column filter before calling getRecords.
        continue;
      }
      switch (f.operator) {
        case 'eq':
          query = query.eq(f.column, f.value);
          break;
        case 'contains':
          query = query.ilike(f.column, `%${f.value}%`);
          break;
        case 'gt':
          query = query.gt(f.column, f.value);
          break;
        case 'lt':
          query = query.lt(f.column, f.value);
          break;
        default:
          break;
      }
    }

    const { data, count, error } = await query;

    if (error) {
      console.error(`[DatabaseService] Error fetching ${table}:`, error.message);
      return { data: [], total: 0 };
    }

    return {
      data: (data ?? []) as TableRecord[],
      total: count ?? (data?.length ?? 0),
    };
  }

  // ────────────────── CRUD (write) ──────────────────────────────

  /** Insert a new row.  Returns the created record. */
  static async create(table: string, record: Partial<TableRecord>): Promise<TableRecord> {
    const { data, error } = await supabase
      .from(table)
      .insert(record)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as TableRecord;
  }

  /**
   * Update an existing row by primary key.
   * Uses the table's PK column (detected from the cached spec).
   */
  static async update(
    table: string,
    id: string | number,
    record: Partial<TableRecord>,
  ): Promise<TableRecord> {
    const pk = await this.findPk(table);
    const { data, error } = await supabase
      .from(table)
      .update(record)
      .eq(pk, id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as TableRecord;
  }

  /** Delete a row by primary key. */
  static async delete(table: string, id: string | number): Promise<void> {
    const pk = await this.findPk(table);
    const { error } = await supabase.from(table).delete().eq(pk, id);
    if (error) throw new Error(error.message);
  }

  // ────────────────── Schema modification (via schema-service) ──

  /**
   * Create a new table through the BaaS schema-service.
   * POST /schemas/v1/schemas
   */
  static async createTable(
    tableName: string,
    columns: Array<{
      name: string;
      type: string;
      nullable: boolean;
      defaultValue?: string | null;
      isPrimary?: boolean;
      isUnique?: boolean;
    }>,
    databaseId: string,
  ): Promise<{ created: boolean; ddl?: string }> {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const body = {
      name: tableName,
      engine: 'postgresql' as const,
      database_id: databaseId,
      columns: columns.map((c) => ({
        name: c.name,
        type: c.type.toLowerCase(),
        nullable: c.nullable,
        default_value: c.defaultValue ?? undefined,
        unique: c.isUnique ?? false,
      })),
      enable_rls: true,
    };

    const res = await fetch(`${SUPABASE_URL}/schemas/v1/schemas`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(text);
    }
    invalidateSpecCache(); // new table → refresh OpenAPI cache
    return res.json();
  }

  // ────────────────── Private helpers ────────────────────────────

  /** Resolve the primary-key column for a given table from the cached spec. */
  private static async findPk(table: string): Promise<string> {
    try {
      const spec = await fetchOpenApiSpec();
      const def = spec.definitions[table];
      if (def) return pkColumn(def.properties);
    } catch { /* fallback */ }
    return 'id';
  }
}
