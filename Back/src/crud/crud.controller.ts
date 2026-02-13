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
 * Column names MUST match the real Prisma schema in schema.prisma
 */
const SCHEMA_MODELS: SchemaModel[] = [
  {
    name: 'User',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'email', type: 'string', isRequired: true },
      { name: 'password', type: 'string', isRequired: true },
      { name: 'first_name', type: 'string', isRequired: true },
      { name: 'last_name', type: 'string' },
      { name: 'phone_number', type: 'string' },
      { name: 'city', type: 'string' },
      { name: 'country', type: 'string' },
      { name: 'postal_code', type: 'string' },
      { name: 'role_id', type: 'integer' },
      { name: 'is_active', type: 'boolean' },
      { name: 'is_email_verified', type: 'boolean' },
      { name: 'gdpr_consent', type: 'boolean' },
      { name: 'preferred_language', type: 'string' },
      { name: 'created_at', type: 'datetime' },
      { name: 'updated_at', type: 'datetime' },
    ],
  },
  {
    name: 'Role',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'name', type: 'string', isRequired: true },
      { name: 'description', type: 'string' },
      { name: 'created_at', type: 'datetime' },
    ],
  },
  {
    name: 'Order',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'order_number', type: 'string', isRequired: true },
      { name: 'user_id', type: 'integer', isRequired: true },
      { name: 'status', type: 'string' },
      { name: 'total_price', type: 'decimal', isRequired: true },
      { name: 'menu_price', type: 'decimal', isRequired: true },
      { name: 'delivery_price', type: 'decimal' },
      { name: 'delivery_address', type: 'string' },
      { name: 'delivery_city', type: 'string' },
      { name: 'delivery_date', type: 'datetime', isRequired: true },
      { name: 'person_number', type: 'integer', isRequired: true },
      { name: 'special_instructions', type: 'string' },
      { name: 'created_at', type: 'datetime' },
      { name: 'updated_at', type: 'datetime' },
    ],
  },
  {
    name: 'Menu',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'title', type: 'string', isRequired: true },
      { name: 'description', type: 'string' },
      { name: 'conditions', type: 'string' },
      { name: 'person_min', type: 'integer', isRequired: true },
      { name: 'price_per_person', type: 'decimal', isRequired: true },
      { name: 'remaining_qty', type: 'integer', isRequired: true },
      { name: 'status', type: 'string' },
      { name: 'diet_id', type: 'integer' },
      { name: 'theme_id', type: 'integer' },
      { name: 'is_seasonal', type: 'boolean' },
      { name: 'created_at', type: 'datetime' },
      { name: 'updated_at', type: 'datetime' },
    ],
  },
  {
    name: 'Dish',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'title', type: 'string', isRequired: true },
      { name: 'description', type: 'string' },
      { name: 'photo_url', type: 'string' },
      { name: 'course_type', type: 'string' },
      { name: 'created_at', type: 'datetime' },
    ],
  },
  {
    name: 'Diet',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'name', type: 'string', isRequired: true },
      { name: 'description', type: 'string' },
      { name: 'icon_url', type: 'string' },
    ],
  },
  {
    name: 'Theme',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'name', type: 'string', isRequired: true },
      { name: 'description', type: 'string' },
      { name: 'icon_url', type: 'string' },
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
      { name: 'unit', type: 'string' },
      { name: 'current_stock', type: 'decimal' },
      { name: 'min_stock_level', type: 'decimal' },
      { name: 'cost_per_unit', type: 'decimal' },
      { name: 'created_at', type: 'datetime' },
      { name: 'updated_at', type: 'datetime' },
    ],
  },
  {
    name: 'Publish',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'user_id', type: 'integer', isRequired: true },
      { name: 'order_id', type: 'integer' },
      { name: 'note', type: 'integer', isRequired: true },
      { name: 'description', type: 'string', isRequired: true },
      { name: 'status', type: 'string' },
      { name: 'created_at', type: 'datetime' },
      { name: 'updated_at', type: 'datetime' },
    ],
  },
  {
    name: 'Discount',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'code', type: 'string', isRequired: true },
      { name: 'description', type: 'string' },
      { name: 'type', type: 'string', isRequired: true },
      { name: 'value', type: 'decimal', isRequired: true },
      { name: 'is_active', type: 'boolean' },
      { name: 'valid_from', type: 'datetime' },
      { name: 'valid_until', type: 'datetime' },
    ],
  },
  {
    name: 'Promotion',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'title', type: 'string', isRequired: true },
      { name: 'description', type: 'string' },
      { name: 'type', type: 'string', isRequired: true },
      { name: 'is_active', type: 'boolean' },
      { name: 'is_public', type: 'boolean' },
      { name: 'start_date', type: 'datetime', isRequired: true },
      { name: 'end_date', type: 'datetime' },
      { name: 'created_at', type: 'datetime' },
      { name: 'updated_at', type: 'datetime' },
    ],
  },
  {
    name: 'WorkingHours',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'day', type: 'string', isRequired: true },
      { name: 'opening', type: 'string', isRequired: true },
      { name: 'closing', type: 'string', isRequired: true },
    ],
  },
  {
    name: 'UserSession',
    columns: [
      { name: 'id', type: 'integer', isId: true, isRequired: true },
      { name: 'user_id', type: 'integer', isRequired: true },
      { name: 'session_token', type: 'string', isRequired: true },
      { name: 'ip_address', type: 'string' },
      { name: 'user_agent', type: 'string' },
      { name: 'expires_at', type: 'datetime', isRequired: true },
      { name: 'is_active', type: 'boolean' },
      { name: 'created_at', type: 'datetime' },
    ],
  },
];

/**
 * Map of string fields per model for search functionality
 */
const MODEL_STRING_FIELDS: Record<string, string[]> = {
  user: ['email', 'first_name', 'last_name', 'phone_number', 'city'],
  role: ['name', 'description'],
  order: ['order_number', 'status', 'delivery_address', 'delivery_city', 'special_instructions'],
  menu: ['title', 'description', 'conditions', 'status'],
  dish: ['title', 'description', 'course_type'],
  diet: ['name', 'description'],
  theme: ['name', 'description'],
  allergen: ['name'],
  ingredient: ['name', 'unit'],
  publish: ['description', 'status'],
  discount: ['code', 'description', 'type'],
  promotion: ['title', 'description', 'type'],
  workingHours: ['day', 'opening', 'closing'],
  userSession: ['session_token', 'ip_address', 'user_agent'],
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
  'publish',
  'discount',
  'promotion',
  'workingHours',
  'userSession',
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
      reviews: 'publish',
      publishes: 'publish',
      discounts: 'discount',
      ingredients: 'ingredient',
      sessions: 'userSession',
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
