/**
 * CRUD Controller - Dynamic database operations for DevBoard
 * Provides schema, counts, and CRUD operations for all Prisma models
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CrudService, PaginatedResult } from './crud.service';
import { PrismaService } from '../prisma';

/** Schema column definition */
interface SchemaColumn {
  name: string;
  type: string;
  isId?: boolean;
  isRequired?: boolean;
  isList?: boolean;
  isRelation?: boolean;
}

/** Schema model definition */
interface SchemaModel {
  name: string;
  columns: SchemaColumn[];
}

/** Map Prisma field types to simple types */
function mapPrismaType(type: string): string {
  const typeMap: Record<string, string> = {
    String: 'string',
    Int: 'integer',
    Float: 'float',
    Decimal: 'decimal',
    Boolean: 'boolean',
    DateTime: 'datetime',
    Json: 'json',
    BigInt: 'bigint',
    Bytes: 'bytes',
  };
  return typeMap[type] || type.toLowerCase();
}

@Controller('crud')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'employe')
export class CrudController {
  constructor(
    private readonly crudService: CrudService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * GET /api/crud/schema
   * Returns Prisma schema information for all models
   */
  @Get('schema')
  async getSchema(): Promise<SchemaModel[]> {
    // Get Prisma DMMF (Data Model Meta Format)
    const dmmf = Prisma.dmmf;
    
    return dmmf.datamodel.models.map(model => ({
      name: model.name,
      columns: model.fields.map(field => ({
        name: field.name,
        type: mapPrismaType(field.type),
        isId: field.isId,
        isRequired: field.isRequired,
        isList: field.isList,
        isRelation: field.relationName !== undefined,
      })),
    }));
  }

  /**
   * GET /api/crud/counts
   * Returns row counts for all tables
   */
  @Get('counts')
  async getCounts(): Promise<Record<string, number>> {
    const dmmf = Prisma.dmmf;
    const counts: Record<string, number> = {};
    
    // Get count for each model
    for (const model of dmmf.datamodel.models) {
      try {
        const modelName = model.name.charAt(0).toLowerCase() + model.name.slice(1);
        const prismaModel = (this.prisma as unknown as Record<string, { count: () => Promise<number> }>)[modelName];
        if (prismaModel?.count) {
          counts[model.name] = await prismaModel.count();
        }
      } catch {
        counts[model.name] = 0;
      }
    }
    
    return counts;
  }

  /**
   * GET /api/crud/:table
   * Fetch records from a table with pagination and filtering
   */
  @Get(':table')
  async getRecords(
    @Param('table') table: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: string,
  ): Promise<PaginatedResult<Record<string, unknown>> | { data: unknown[]; total: number }> {
    const modelName = this.getModelName(table);
    if (!modelName) {
      return { data: [], total: 0 };
    }

    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    
    // Build where clause with search
    let where: Record<string, unknown> = {};
    if (search) {
      // Search across string columns
      where = this.buildSearchWhere(modelName, search);
    }

    // Build orderBy
    let orderByClause: Record<string, 'asc' | 'desc'> = {};
    if (orderBy) {
      orderByClause = { [orderBy]: (order === 'desc' ? 'desc' : 'asc') };
    }

    return this.crudService.findAll(modelName, {
      page: pageNum,
      limit: limitNum,
      where,
      orderBy: orderByClause,
    });
  }

  /**
   * GET /api/crud/:table/:id
   * Fetch a single record by ID
   */
  @Get(':table/:id')
  async getRecord(
    @Param('table') table: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const modelName = this.getModelName(table);
    if (!modelName) {
      return null;
    }
    return this.crudService.findOne(modelName, String(id));
  }

  /**
   * POST /api/crud/:table
   * Create a new record
   */
  @Post(':table')
  async createRecord(
    @Param('table') table: string,
    @Body() data: Record<string, unknown>,
  ) {
    const modelName = this.getModelName(table);
    if (!modelName) {
      throw new Error(`Unknown table: ${table}`);
    }
    return this.crudService.create(modelName, data);
  }

  /**
   * PUT /api/crud/:table/:id
   * Update an existing record
   */
  @Put(':table/:id')
  async updateRecord(
    @Param('table') table: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Record<string, unknown>,
  ) {
    const modelName = this.getModelName(table);
    if (!modelName) {
      throw new Error(`Unknown table: ${table}`);
    }
    return this.crudService.update(modelName, String(id), data);
  }

  /**
   * DELETE /api/crud/:table/:id
   * Delete a record
   */
  @Delete(':table/:id')
  async deleteRecord(
    @Param('table') table: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const modelName = this.getModelName(table);
    if (!modelName) {
      throw new Error(`Unknown table: ${table}`);
    }
    return this.crudService.remove(modelName, String(id));
  }

  /**
   * Map table endpoint names to Prisma model names
   */
  private getModelName(table: string): string | null {
    const tableToModel: Record<string, string> = {
      users: 'user',
      roles: 'role',
      orders: 'order',
      menus: 'menu',
      diets: 'diet',
      themes: 'theme',
      dishes: 'dish',
      allergens: 'allergen',
      'working-hours': 'workingHours',
      reviews: 'review',
      discounts: 'discount',
      ingredients: 'ingredient',
      sessions: 'session',
      promotions: 'promotion',
    };
    return tableToModel[table] || null;
  }

  /**
   * Build search where clause for string fields
   */
  private buildSearchWhere(modelName: string, search: string): Record<string, unknown> {
    const dmmf = Prisma.dmmf;
    const model = dmmf.datamodel.models.find(m => m.name.toLowerCase() === modelName);
    
    if (!model) return {};

    // Get string fields
    const stringFields = model.fields
      .filter(f => f.type === 'String' && !f.relationName)
      .map(f => f.name);

    if (stringFields.length === 0) return {};

    // Build OR clause for search across all string fields
    return {
      OR: stringFields.map(field => ({
        [field]: { contains: search, mode: 'insensitive' },
      })),
    };
  }
}
