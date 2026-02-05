/**
 * CRUD Service
 * ============
 * Generic CRUD operations for all entities
 * Includes schema modification capabilities
 */

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

type EntityType = 
  | 'user'
  | 'role'
  | 'menu'
  | 'dish'
  | 'allergen'
  | 'diet'
  | 'theme'
  | 'order'
  | 'workingHours';

interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string | null;
  isPrimary?: boolean;
  isUnique?: boolean;
  foreignKey?: { table: string; column: string } | null;
}

@Injectable()
export class CrudService {
  private readonly SALT_ROUNDS = 12;
  private readonly logger = new Logger(CrudService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================================
  // RAW SQL EXECUTION (Admin only)
  // ============================================================

  /**
   * Execute raw SQL query - READ operations only for safety
   */
  async executeRawQuery(sql: string): Promise<{ rows: unknown[]; rowCount: number }> {
    const trimmed = sql.trim().toUpperCase();
    
    // Only allow SELECT for safety
    if (!trimmed.startsWith('SELECT')) {
      throw new BadRequestException('Only SELECT queries are allowed');
    }
    
    this.logger.log(`Executing raw SQL: ${sql.substring(0, 100)}...`);
    
    try {
      const result = await this.prisma.$queryRawUnsafe(sql);
      const rows = Array.isArray(result) ? result : [result];
      return { rows, rowCount: rows.length };
    } catch (error) {
      this.logger.error(`SQL execution failed: ${error}`);
      throw new BadRequestException(
        `SQL Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Execute raw SQL mutation - INSERT, UPDATE, DELETE (dangerous!)
   */
  async executeRawMutation(sql: string): Promise<{ affected: number }> {
    const trimmed = sql.trim().toUpperCase();
    const allowed = ['INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'];
    
    if (!allowed.some(cmd => trimmed.startsWith(cmd))) {
      throw new BadRequestException(`Only ${allowed.join(', ')} are allowed`);
    }
    
    this.logger.warn(`Executing raw SQL mutation: ${sql.substring(0, 100)}...`);
    
    try {
      const result = await this.prisma.$executeRawUnsafe(sql);
      return { affected: typeof result === 'number' ? result : 0 };
    } catch (error) {
      this.logger.error(`SQL mutation failed: ${error}`);
      throw new BadRequestException(
        `SQL Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Execute shell command - Full access (dev mode only!)
   */
  async executeShellCommand(command: string): Promise<{ output: string; exitCode: number }> {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    this.logger.log(`Executing shell: ${command}`);

    try {
      const { stdout, stderr } = await execAsync(command, { 
        timeout: 30000, 
        cwd: process.cwd(),
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        env: { ...process.env, TERM: 'xterm-256color' },
      });
      return { output: stdout || stderr || '(no output)', exitCode: 0 };
    } catch (error: unknown) {
      const err = error as { stdout?: string; stderr?: string; code?: number };
      return {
        output: err.stderr || err.stdout || 'Command failed',
        exitCode: err.code || 1,
      };
    }
  }

  // ============================================================
  // SCHEMA - Get database schema from Prisma
  // ============================================================

  getSchema() {
    return this.prisma.getSchema();
  }

  /**
   * Get all tables from PostgreSQL (including dynamically created tables)
   */
  async getAllTables() {
    return this.prisma.getAllTables();
  }

  /**
   * Get full database schema from PostgreSQL
   */
  async getFullDatabaseSchema() {
    return this.prisma.getFullDatabaseSchema();
  }

  /**
   * Get foreign key relationships
   */
  async getForeignKeys() {
    return this.prisma.getForeignKeys();
  }

  // ============================================================
  // SCHEMA MODIFICATION - Create tables and add columns
  // ============================================================

  /**
   * Create a new table in the database
   * Automatically adds id SERIAL PRIMARY KEY
   */
  async createTable(tableName: string, columns: ColumnDefinition[]) {
    // Validate table name (snake_case, alphanumeric)
    if (!/^[a-z][a-z0-9_]*$/.test(tableName)) {
      throw new BadRequestException('Table name must be lowercase alphanumeric with underscores, starting with a letter');
    }

    // Build column definitions
    const columnDefs: string[] = ['id SERIAL PRIMARY KEY'];
    
    for (const col of columns) {
      const colDef = this.buildColumnDefinition(col);
      columnDefs.push(colDef);
    }

    // Add timestamps
    columnDefs.push('"createdAt" TIMESTAMP DEFAULT NOW()');
    columnDefs.push('"updatedAt" TIMESTAMP DEFAULT NOW()');

    // Build SQL
    const sql = `CREATE TABLE "${tableName}" (\n  ${columnDefs.join(',\n  ')}\n)`;
    
    this.logger.log(`Creating table: ${tableName}`);
    this.logger.debug(`SQL: ${sql}`);

    try {
      await this.prisma.$executeRawUnsafe(sql);
      
      // Add foreign key constraints separately (cleaner error handling)
      for (const col of columns) {
        if (col.foreignKey) {
          const fkSql = `ALTER TABLE "${tableName}" ADD CONSTRAINT "fk_${tableName}_${col.name}" 
            FOREIGN KEY ("${col.name}") REFERENCES "${col.foreignKey.table}"("${col.foreignKey.column}")`;
          await this.prisma.$executeRawUnsafe(fkSql);
        }
      }

      return { success: true, message: `Table "${tableName}" created successfully` };
    } catch (error) {
      this.logger.error(`Failed to create table: ${error}`);
      throw new BadRequestException(`Failed to create table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add a column to an existing table
   */
  async addColumn(tableName: string, column: ColumnDefinition) {
    // Validate column name
    if (!/^[a-z][a-z0-9_]*$/i.test(column.name)) {
      throw new BadRequestException('Column name must be alphanumeric with underscores');
    }

    const colDef = this.buildColumnDefinition(column);
    const sql = `ALTER TABLE "${tableName}" ADD COLUMN ${colDef}`;
    
    this.logger.log(`Adding column to ${tableName}: ${column.name}`);
    this.logger.debug(`SQL: ${sql}`);

    try {
      await this.prisma.$executeRawUnsafe(sql);

      // Add foreign key constraint if specified
      if (column.foreignKey) {
        const fkSql = `ALTER TABLE "${tableName}" ADD CONSTRAINT "fk_${tableName}_${column.name}" 
          FOREIGN KEY ("${column.name}") REFERENCES "${column.foreignKey.table}"("${column.foreignKey.column}")`;
        await this.prisma.$executeRawUnsafe(fkSql);
      }

      return { success: true, message: `Column "${column.name}" added to "${tableName}"` };
    } catch (error) {
      this.logger.error(`Failed to add column: ${error}`);
      throw new BadRequestException(`Failed to add column: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build SQL column definition from ColumnDefinition
   */
  private buildColumnDefinition(col: ColumnDefinition): string {
    const parts: string[] = [`"${col.name}"`, this.mapColumnType(col.type)];
    
    if (col.isPrimary) {
      parts.push('PRIMARY KEY');
    }
    
    if (!col.nullable) {
      parts.push('NOT NULL');
    }
    
    if (col.isUnique) {
      parts.push('UNIQUE');
    }
    
    if (col.defaultValue !== undefined && col.defaultValue !== null && col.defaultValue !== '') {
      // Handle special default values
      const defaultVal = col.defaultValue.toUpperCase();
      if (['NOW()', 'CURRENT_TIMESTAMP', 'TRUE', 'FALSE', 'NULL'].includes(defaultVal) || 
          !isNaN(Number(col.defaultValue))) {
        parts.push(`DEFAULT ${col.defaultValue}`);
      } else {
        parts.push(`DEFAULT '${col.defaultValue.replace(/'/g, "''")}'`);
      }
    }
    
    return parts.join(' ');
  }

  /**
   * Map frontend column types to PostgreSQL types
   */
  private mapColumnType(type: string): string {
    const typeMap: Record<string, string> = {
      'TEXT': 'TEXT',
      'INTEGER': 'INTEGER',
      'BIGINT': 'BIGINT',
      'DECIMAL': 'DECIMAL(10,2)',
      'BOOLEAN': 'BOOLEAN',
      'TIMESTAMP': 'TIMESTAMP',
      'DATE': 'DATE',
      'TIME': 'TIME',
      'JSON': 'JSONB',
      'UUID': 'UUID',
    };
    return typeMap[type.toUpperCase()] || 'TEXT';
  }

  // ============================================================
  // TABLE COUNTS - Get row counts for all tables
  // ============================================================

  async getTableCounts() {
    const [
      users, roles, orders, menus, dishes,
      diets, themes, allergens, workingHours, publishes
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.role.count(),
      this.prisma.order.count(),
      this.prisma.menu.count(),
      this.prisma.dish.count(),
      this.prisma.diet.count(),
      this.prisma.theme.count(),
      this.prisma.allergen.count(),
      this.prisma.workingHours.count(),
      this.prisma.publish.count(),
    ]);

    return {
      User: users,
      Role: roles,
      Order: orders,
      Menu: menus,
      Dish: dishes,
      Diet: diets,
      Theme: themes,
      Allergen: allergens,
      WorkingHours: workingHours,
      Publish: publishes,
    };
  }

  // ============================================================
  // USER CRUD
  // ============================================================

  async findAllUsers(options?: { skip?: number; take?: number; search?: string }) {
    const where = options?.search
      ? {
          OR: [
            { email: { contains: options.search, mode: 'insensitive' as const } },
            { first_name: { contains: options.search, mode: 'insensitive' as const } },
            { telephone_number: { contains: options.search, mode: 'insensitive' as const } },
            { city: { contains: options.search, mode: 'insensitive' as const } },
            { country: { contains: options.search, mode: 'insensitive' as const } },
            { postal_address: { contains: options.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Ensure skip/take are numbers (query params come as strings)
    const skip = options?.skip ? Number(options.skip) : 0;
    const take = options?.take ? Number(options.take) : 50;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        include: { role: true },
        orderBy: { id: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(this.transformUser),
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  async findOneUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true, orders: true },
    });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return this.transformUser(user);
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    telephoneNumber?: string;
    city?: string;
    country?: string;
    postalAddress?: string;
    roleId?: number;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new BadRequestException('Email already exists');

    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        first_name: data.firstName,
        telephone_number: data.telephoneNumber || '',
        city: data.city || '',
        country: data.country || 'France',
        postal_address: data.postalAddress || '',
        roleId: data.roleId || 1,
      },
      include: { role: true },
    });

    return this.transformUser(user);
  }

  async updateUser(id: number, data: Partial<{
    email: string;
    password: string;
    firstName: string;
    telephoneNumber: string;
    city: string;
    country: string;
    postalAddress: string;
    roleId: number;
  }>) {
    const updateData: Record<string, unknown> = {};

    if (data.email) updateData.email = data.email;
    if (data.password) updateData.password = await bcrypt.hash(data.password, this.SALT_ROUNDS);
    if (data.firstName) updateData.first_name = data.firstName;
    if (data.telephoneNumber !== undefined) updateData.telephone_number = data.telephoneNumber;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.postalAddress !== undefined) updateData.postal_address = data.postalAddress;
    if (data.roleId !== undefined) updateData.roleId = data.roleId;

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });

    return this.transformUser(user);
  }

  async deleteUser(id: number) {
    await this.prisma.user.delete({ where: { id } });
    return { message: `User #${id} deleted successfully` };
  }

  private transformUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      password: user.password, // Hashed password for admin view
      firstName: user.first_name,
      telephoneNumber: user.telephone_number,
      city: user.city,
      country: user.country,
      postalAddress: user.postal_address,
      role: user.role?.libelle || 'client',
      roleId: user.roleId,
      gdprConsent: user.gdprConsent,
      gdprConsentDate: user.gdprConsentDate,
      marketingConsent: user.marketingConsent,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      ordersCount: user.orders?.length || user._count?.orders || 0,
    };
  }

  // ============================================================
  // ROLE CRUD
  // ============================================================

  async findAllRoles() {
    return this.prisma.role.findMany({ orderBy: { id: 'asc' } });
  }

  async findOneRole(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException(`Role #${id} not found`);
    return role;
  }

  async createRole(data: { libelle: string }) {
    return this.prisma.role.create({ data });
  }

  async updateRole(id: number, data: { libelle: string }) {
    return this.prisma.role.update({ where: { id }, data });
  }

  async deleteRole(id: number) {
    await this.prisma.role.delete({ where: { id } });
    return { message: `Role #${id} deleted` };
  }

  // ============================================================
  // MENU CRUD
  // ============================================================

  async findAllMenus(options?: { skip?: number; take?: number; search?: string }) {
    const where = options?.search
      ? { title: { contains: options.search, mode: 'insensitive' as const } }
      : {};

    // Ensure skip/take are numbers (query params come as strings)
    const skip = options?.skip ? Number(options.skip) : 0;
    const take = options?.take ? Number(options.take) : 50;

    const [menus, total] = await Promise.all([
      this.prisma.menu.findMany({
        where,
        skip,
        take,
        include: { diet: true, theme: true, dishes: true },
        orderBy: { id: 'desc' },
      }),
      this.prisma.menu.count({ where }),
    ]);

    return { data: menus, total };
  }

  async findOneMenu(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: { diet: true, theme: true, dishes: { include: { allergens: true } } },
    });
    if (!menu) throw new NotFoundException(`Menu #${id} not found`);
    return menu;
  }

  async createMenu(data: {
    title: string;
    person_min: number;
    price_per_person: number;
    description: string;
    remaining_qty: number;
    dietId?: number;
    themeId?: number;
  }) {
    return this.prisma.menu.create({ data, include: { diet: true, theme: true } });
  }

  async updateMenu(id: number, data: Partial<{
    title: string;
    person_min: number;
    price_per_person: number;
    description: string;
    remaining_qty: number;
    dietId: number;
    themeId: number;
  }>) {
    return this.prisma.menu.update({ where: { id }, data, include: { diet: true, theme: true } });
  }

  async deleteMenu(id: number) {
    await this.prisma.menu.delete({ where: { id } });
    return { message: `Menu #${id} deleted` };
  }

  // ============================================================
  // DISH CRUD
  // ============================================================

  async findAllDishes(options?: { skip?: number; take?: number; search?: string; menuId?: number }) {
    const where: Record<string, unknown> = {};
    if (options?.search) where.title_dish = { contains: options.search, mode: 'insensitive' };
    if (options?.menuId) where.menuId = Number(options.menuId);

    // Ensure skip/take are numbers (query params come as strings)
    const skip = options?.skip ? Number(options.skip) : 0;
    const take = options?.take ? Number(options.take) : 50;

    const [dishes, total] = await Promise.all([
      this.prisma.dish.findMany({
        where,
        skip,
        take,
        include: { menu: true, allergens: true },
        orderBy: { id: 'desc' },
      }),
      this.prisma.dish.count({ where }),
    ]);

    return { data: dishes, total };
  }

  async findOneDish(id: number) {
    const dish = await this.prisma.dish.findUnique({
      where: { id },
      include: { menu: true, allergens: true },
    });
    if (!dish) throw new NotFoundException(`Dish #${id} not found`);
    return dish;
  }

  async createDish(data: {
    title_dish: string;
    photo: string;
    menuId?: number;
    allergenIds?: number[];
  }) {
    return this.prisma.dish.create({
      data: {
        title_dish: data.title_dish,
        photo: data.photo,
        menuId: data.menuId,
        allergens: data.allergenIds ? { connect: data.allergenIds.map(id => ({ id })) } : undefined,
      },
      include: { menu: true, allergens: true },
    });
  }

  async updateDish(id: number, data: Partial<{
    title_dish: string;
    photo: string;
    menuId: number;
    allergenIds: number[];
  }>) {
    const updateData: Record<string, unknown> = {};
    if (data.title_dish) updateData.title_dish = data.title_dish;
    if (data.photo) updateData.photo = data.photo;
    if (data.menuId !== undefined) updateData.menuId = data.menuId;
    if (data.allergenIds) {
      updateData.allergens = { set: data.allergenIds.map(id => ({ id })) };
    }

    return this.prisma.dish.update({
      where: { id },
      data: updateData,
      include: { menu: true, allergens: true },
    });
  }

  async deleteDish(id: number) {
    await this.prisma.dish.delete({ where: { id } });
    return { message: `Dish #${id} deleted` };
  }

  // ============================================================
  // ALLERGEN CRUD
  // ============================================================

  async findAllAllergens() {
    return this.prisma.allergen.findMany({ orderBy: { libelle: 'asc' } });
  }

  async findOneAllergen(id: number) {
    const allergen = await this.prisma.allergen.findUnique({ where: { id } });
    if (!allergen) throw new NotFoundException(`Allergen #${id} not found`);
    return allergen;
  }

  async createAllergen(data: { libelle: string }) {
    return this.prisma.allergen.create({ data });
  }

  async updateAllergen(id: number, data: { libelle: string }) {
    return this.prisma.allergen.update({ where: { id }, data });
  }

  async deleteAllergen(id: number) {
    await this.prisma.allergen.delete({ where: { id } });
    return { message: `Allergen #${id} deleted` };
  }

  // ============================================================
  // DIET CRUD
  // ============================================================

  async findAllDiets() {
    return this.prisma.diet.findMany({ orderBy: { libelle: 'asc' } });
  }

  async findOneDiet(id: number) {
    const diet = await this.prisma.diet.findUnique({ where: { id } });
    if (!diet) throw new NotFoundException(`Diet #${id} not found`);
    return diet;
  }

  async createDiet(data: { libelle: string }) {
    return this.prisma.diet.create({ data });
  }

  async updateDiet(id: number, data: { libelle: string }) {
    return this.prisma.diet.update({ where: { id }, data });
  }

  async deleteDiet(id: number) {
    await this.prisma.diet.delete({ where: { id } });
    return { message: `Diet #${id} deleted` };
  }

  // ============================================================
  // THEME CRUD
  // ============================================================

  async findAllThemes() {
    return this.prisma.theme.findMany({ orderBy: { libelle: 'asc' } });
  }

  async findOneTheme(id: number) {
    const theme = await this.prisma.theme.findUnique({ where: { id } });
    if (!theme) throw new NotFoundException(`Theme #${id} not found`);
    return theme;
  }

  async createTheme(data: { libelle: string }) {
    return this.prisma.theme.create({ data });
  }

  async updateTheme(id: number, data: { libelle: string }) {
    return this.prisma.theme.update({ where: { id }, data });
  }

  async deleteTheme(id: number) {
    await this.prisma.theme.delete({ where: { id } });
    return { message: `Theme #${id} deleted` };
  }

  // ============================================================
  // ORDER CRUD
  // ============================================================

  async findAllOrders(options?: { skip?: number; take?: number; status?: string; userId?: number }) {
    const where: Record<string, unknown> = {};
    if (options?.status) where.status = options.status;
    if (options?.userId) where.userId = Number(options.userId);

    // Ensure skip/take are numbers (query params come as strings)
    const skip = options?.skip ? Number(options.skip) : 0;
    const take = options?.take ? Number(options.take) : 50;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        include: { user: { select: { id: true, email: true, first_name: true } }, menus: true },
        orderBy: { order_date: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data: orders, total };
  }

  async findOneOrder(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, first_name: true, telephone_number: true } },
        menus: { include: { dishes: true } },
      },
    });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  async createOrder(data: {
    order_number: string;
    order_date: Date;
    prestation_date: Date;
    delivery_hour: string;
    menu_price: number;
    person_number: number;
    delivery_price: number;
    status: string;
    material_lending: boolean;
    get_back_material: boolean;
    userId: number;
    menuIds?: number[];
  }) {
    return this.prisma.order.create({
      data: {
        order_number: data.order_number,
        order_date: data.order_date,
        prestation_date: data.prestation_date,
        delivery_hour: data.delivery_hour,
        menu_price: data.menu_price,
        person_number: data.person_number,
        delivery_price: data.delivery_price,
        status: data.status,
        material_lending: data.material_lending,
        get_back_material: data.get_back_material,
        userId: data.userId,
        menus: data.menuIds ? { connect: data.menuIds.map(id => ({ id })) } : undefined,
      },
      include: { user: { select: { id: true, email: true, first_name: true } }, menus: true },
    });
  }

  async updateOrder(id: number, data: Partial<{
    status: string;
    delivery_hour: string;
    material_lending: boolean;
    get_back_material: boolean;
    menuIds: number[];
  }>) {
    const updateData: Record<string, unknown> = {};
    if (data.status) updateData.status = data.status;
    if (data.delivery_hour) updateData.delivery_hour = data.delivery_hour;
    if (data.material_lending !== undefined) updateData.material_lending = data.material_lending;
    if (data.get_back_material !== undefined) updateData.get_back_material = data.get_back_material;
    if (data.menuIds) updateData.menus = { set: data.menuIds.map(id => ({ id })) };

    return this.prisma.order.update({
      where: { id },
      data: updateData,
      include: { user: { select: { id: true, email: true, first_name: true } }, menus: true },
    });
  }

  async deleteOrder(id: number) {
    await this.prisma.order.delete({ where: { id } });
    return { message: `Order #${id} deleted` };
  }

  // ============================================================
  // WORKING HOURS CRUD
  // ============================================================

  async findAllWorkingHours() {
    return this.prisma.workingHours.findMany({ orderBy: { id: 'asc' } });
  }

  async findOneWorkingHours(id: number) {
    const wh = await this.prisma.workingHours.findUnique({ where: { id } });
    if (!wh) throw new NotFoundException(`WorkingHours #${id} not found`);
    return wh;
  }

  async createWorkingHours(data: { day: string; opening: string; closing: string }) {
    return this.prisma.workingHours.create({ data });
  }

  async updateWorkingHours(id: number, data: Partial<{ day: string; opening: string; closing: string }>) {
    return this.prisma.workingHours.update({ where: { id }, data });
  }

  async deleteWorkingHours(id: number) {
    await this.prisma.workingHours.delete({ where: { id } });
    return { message: `WorkingHours #${id} deleted` };
  }
}
