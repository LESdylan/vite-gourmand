/**
 * CRUD Controller - Dynamic database operations for DevBoard
 * Provides schema, counts, and CRUD operations for all Prisma models
 *
 * Note: Prisma 7 removed DMMF access, so we use static schema definitions
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

/**
 * Static schema definitions for Prisma 7 compatibility
 * (DMMF is no longer available in Prisma 7)
 */
const SCHEMA_MODELS: SchemaModel[] = [
  {
    name: 'User',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'email', type: 'string', isRequired: true },
      { name: 'password_hash', type: 'string', isRequired: true },
      { name: 'first_name', type: 'string', isRequired: true },
      { name: 'last_name', type: 'string', isRequired: true },
      { name: 'phone', type: 'string' },
      { name: 'role_id', type: 'integer', isRequired: true },
      { name: 'created_at', type: 'datetime', isRequired: true },
      { name: 'updated_at', type: 'datetime', isRequired: true },
    ],
  },
  {
    name: 'Role',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'name', type: 'string', isRequired: true },
      { name: 'description', type: 'string' },
    ],
  },
  {
    name: 'Order',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'user_id', type: 'integer', isRequired: true },
      { name: 'status', type: 'string', isRequired: true },
      { name: 'total_amount', type: 'decimal', isRequired: true },
      { name: 'delivery_address', type: 'string' },
      { name: 'notes', type: 'string' },
      { name: 'created_at', type: 'datetime', isRequired: true },
      { name: 'updated_at', type: 'datetime', isRequired: true },
    ],
  },
  {
    name: 'Menu',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'name', type: 'string', isRequired: true },
      { name: 'description', type: 'string' },
      { name: 'price', type: 'decimal', isRequired: true },
      { name: 'is_active', type: 'boolean', isRequired: true },
    ],
  },
  {
    name: 'Dish',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'name', type: 'string', isRequired: true },
      { name: 'description', type: 'string' },
      { name: 'price', type: 'decimal', isRequired: true },
      { name: 'category', type: 'string' },
      { name: 'is_active', type: 'boolean', isRequired: true },
    ],
  },
  {
    name: 'Diet',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'name', type: 'string', isRequired: true },
      { name: 'description', type: 'string' },
    ],
  },
  {
    name: 'Theme',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'name', type: 'string', isRequired: true },
      { name: 'description', type: 'string' },
    ],
  },
  {
    name: 'Allergen',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'name', type: 'string', isRequired: true },
      { name: 'icon_url', type: 'string' },
    ],
  },
  {
    name: 'Ingredient',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'name', type: 'string', isRequired: true },
      { name: 'description', type: 'string' },
    ],
  },
  {
    name: 'Review',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'user_id', type: 'integer', isRequired: true },
      { name: 'rating', type: 'integer', isRequired: true },
      { name: 'comment', type: 'string' },
      { name: 'created_at', type: 'datetime', isRequired: true },
    ],
  },
  {
    name: 'Discount',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'code', type: 'string', isRequired: true },
      { name: 'description', type: 'string' },
      { name: 'percentage', type: 'decimal' },
      { name: 'is_active', type: 'boolean', isRequired: true },
    ],
  },
  {
    name: 'Promotion',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'name', type: 'string', isRequired: true },
      { name: 'description', type: 'string' },
      { name: 'start_date', type: 'datetime' },
      { name: 'end_date', type: 'datetime' },
      { name: 'is_active', type: 'boolean', isRequired: true },
      { name: 'is_public', type: 'boolean', isRequired: true },
    ],
  },
  {
    name: 'WorkingHours',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'day_of_week', type: 'integer', isRequired: true },
      { name: 'open_time', type: 'string', isRequired: true },
      { name: 'close_time', type: 'string', isRequired: true },
      { name: 'is_closed', type: 'boolean', isRequired: true },
    ],
  },
  {
    name: 'Session',
    columns: [
      { name: 'id', type: 'string', isId: true, isRequired: true },
      { name: 'user_id', type: 'integer', isRequired: true },
      { name: 'expires_at', type: 'datetime', isRequired: true },
      { name: 'created_at', type: 'datetime', isRequired: true },
    ],
  },
];

/**
 * Map of string fields per model for search functionality
 */
const MODEL_STRING_FIELDS: Record<string, string[]> = {
  user: ['email', 'first_name', 'last_name', 'phone'],
  role: ['name', 'description'],
  order: ['status', 'delivery_address', 'notes'],
  menu: ['name', 'description'],
  dish: ['name', 'description', 'category'],
  diet: ['name', 'description'],
  theme: ['name', 'description'],
  allergen: ['name'],
  ingredient: ['name', 'description'],
  review: ['comment'],
  discount: ['code', 'description'],
  promotion: ['name', 'description'],
  workingHours: ['open_time', 'close_time'],
  session: ['id'],
};

/**
 * List of model names for counting
 */
const MODEL_NAMES = [
  'user',
  'role',
  'order',
  'menu',
  'dish',
  'diet',
  'theme',
  'allergen',
  'ingredient',
  'review',
  'discount',
  'promotion',
  'workingHours',
  'session',
];

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
    return SCHEMA_MODELS;
  }

  /**
   * GET /api/crud/counts
   * Returns row counts for all tables
   */
  @Get('counts')
  async getCounts(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    // Get count for each model
    for (const modelName of MODEL_NAMES) {
      try {
        const prismaModel = (
          this.prisma as unknown as Record<
            string,
            { count: () => Promise<number> }
          >
        )[modelName];
        if (prismaModel?.count) {
          const pascalName =
            modelName.charAt(0).toUpperCase() + modelName.slice(1);
          counts[pascalName] = await prismaModel.count();
        }
      } catch {
        const pascalName =
          modelName.charAt(0).toUpperCase() + modelName.slice(1);
        counts[pascalName] = 0;
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
  ): Promise<
    | PaginatedResult<Record<string, unknown>>
    | { data: unknown[]; total: number }
  > {
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
      orderByClause = { [orderBy]: order === 'desc' ? 'desc' : 'asc' };
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
  private buildSearchWhere(
    modelName: string,
    search: string,
  ): Record<string, unknown> {
    const stringFields = MODEL_STRING_FIELDS[modelName];

    if (!stringFields || stringFields.length === 0) return {};

    // Build OR clause for search across all string fields
    return {
      OR: stringFields.map((field: string) => ({
        [field]: { contains: search, mode: 'insensitive' },
      })),
    };
  }
}
