import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL || '';
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to PostgreSQL database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
    this.logger.log('Disconnected from PostgreSQL database');
  }

  /**
   * Get database schema from Prisma DMMF
   * Returns all models with their fields and types
   */
  getSchema() {
    const models = Prisma.dmmf.datamodel.models;
    return models.map(model => ({
      name: model.name,
      columns: model.fields.map(field => ({
        name: field.name,
        type: field.type,
        isId: field.isId ?? false,
        isRequired: field.isRequired ?? false,
        isList: field.isList ?? false,
        isRelation: !!field.relationName,
      })),
    }));
  }

  /**
   * Get all tables directly from PostgreSQL information_schema
   * This includes dynamically created tables, not just Prisma models
   */
  async getAllTables(): Promise<string[]> {
    const result = await this.$queryRaw<{ tablename: string }[]>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    return result.map(row => row.tablename);
  }

  /**
   * Get column information for a specific table from PostgreSQL
   */
  async getTableColumns(tableName: string): Promise<{
    name: string;
    type: string;
    isNullable: boolean;
    defaultValue: string | null;
    isPrimaryKey: boolean;
  }[]> {
    const columns = await this.$queryRaw<{
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string | null;
    }[]>`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${tableName}
      ORDER BY ordinal_position
    `;

    // Get primary key columns using information_schema (more compatible)
    const pkResult = await this.$queryRaw<{ column_name: string }[]>`
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = ${tableName}
    `;
    const pkColumns = new Set(pkResult.map(r => r.column_name));

    return columns.map(col => ({
      name: col.column_name,
      type: col.data_type,
      isNullable: col.is_nullable === 'YES',
      defaultValue: col.column_default,
      isPrimaryKey: pkColumns.has(col.column_name),
    }));
  }

  /**
   * Get full schema for all tables from PostgreSQL
   */
  async getFullDatabaseSchema(): Promise<{
    name: string;
    columns: {
      name: string;
      type: string;
      isNullable: boolean;
      defaultValue: string | null;
      isPrimaryKey: boolean;
    }[];
  }[]> {
    const tables = await this.getAllTables();
    const schema = await Promise.all(
      tables.map(async tableName => ({
        name: tableName,
        columns: await this.getTableColumns(tableName),
      }))
    );
    return schema;
  }

  /**
   * Get foreign key information for all tables
   */
  async getForeignKeys(): Promise<{
    tableName: string;
    columnName: string;
    referencedTable: string;
    referencedColumn: string;
  }[]> {
    const result = await this.$queryRaw<{
      table_name: string;
      column_name: string;
      foreign_table_name: string;
      foreign_column_name: string;
    }[]>`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    `;
    return result.map(r => ({
      tableName: r.table_name,
      columnName: r.column_name,
      referencedTable: r.foreign_table_name,
      referencedColumn: r.foreign_column_name,
    }));
  }
}
