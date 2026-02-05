/**
 * CRUD Controller
 * ===============
 * Full CRUD REST API for all entities
 * Admin-only access for write operations
 * Public read access for some resources
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CrudService } from './crud.service';
import {
  PaginationDto,
  CreateUserDto,
  UpdateUserDto,
  CreateRoleDto,
  UpdateRoleDto,
  CreateMenuDto,
  UpdateMenuDto,
  CreateDishDto,
  UpdateDishDto,
  CreateLabelDto,
  UpdateLabelDto,
  CreateOrderDto,
  UpdateOrderDto,
  CreateWorkingHoursDto,
  UpdateWorkingHoursDto,
} from './dto';
import { Roles, Public } from '../common';

@Controller('crud')
export class CrudController {
  constructor(private readonly crudService: CrudService) {}

  // ============================================================
  // RAW SQL EXECUTION
  // ============================================================

  @Post('sql/query')
  @Public() // Should be @Roles('admin') in production!
  executeQuery(@Body() dto: { sql: string }) {
    return this.crudService.executeRawQuery(dto.sql);
  }

  @Post('sql/execute')
  @Public() // Should be @Roles('admin') in production!
  executeMutation(@Body() dto: { sql: string }) {
    return this.crudService.executeRawMutation(dto.sql);
  }

  @Post('shell')
  @Public() // Should be @Roles('admin') in production!
  executeShell(@Body() dto: { command: string }) {
    return this.crudService.executeShellCommand(dto.command);
  }

  // ============================================================
  // SCHEMA - Get database schema dynamically
  // ============================================================

  @Get('schema')
  @Public()
  getSchema() {
    return this.crudService.getSchema();
  }

  /**
   * Get all tables from PostgreSQL (including dynamically created tables)
   */
  @Get('schema/tables')
  @Public()
  async getAllTables() {
    return this.crudService.getAllTables();
  }

  /**
   * Get full database schema from PostgreSQL (all tables with columns)
   */
  @Get('schema/full')
  @Public()
  async getFullSchema() {
    return this.crudService.getFullDatabaseSchema();
  }

  /**
   * Get foreign key relationships
   */
  @Get('schema/foreign-keys')
  @Public()
  async getForeignKeys() {
    return this.crudService.getForeignKeys();
  }

  // ============================================================
  // SCHEMA MODIFICATION - Create tables and add columns
  // ============================================================

  @Post('schema/table')
  @Public()
  createTable(@Body() dto: { tableName: string; columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    defaultValue?: string | null;
    isPrimary?: boolean;
    isUnique?: boolean;
    foreignKey?: { table: string; column: string } | null;
  }> }) {
    return this.crudService.createTable(dto.tableName, dto.columns);
  }

  @Post('schema/column')
  @Public()
  addColumn(@Body() dto: { tableName: string; column: {
    name: string;
    type: string;
    nullable: boolean;
    defaultValue?: string | null;
    isUnique?: boolean;
    foreignKey?: { table: string; column: string } | null;
  } }) {
    return this.crudService.addColumn(dto.tableName, dto.column);
  }

  // ============================================================
  // TABLE COUNTS - Get row counts for all tables
  // ============================================================

  @Get('counts')
  @Public()
  getTableCounts() {
    return this.crudService.getTableCounts();
  }

  // ============================================================
  // USERS CRUD - Public read for DevBoard, Admin write
  // ============================================================

  @Get('users')
  @Public()
  findAllUsers(@Query() query: PaginationDto) {
    return this.crudService.findAllUsers(query);
  }

  @Get('users/:id')
  @Public()
  findOneUser(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.findOneUser(id);
  }

  @Post('users')
  @Public()
  createUser(@Body() dto: CreateUserDto) {
    return this.crudService.createUser(dto);
  }

  @Put('users/:id')
  @Public()
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.crudService.updateUser(id, dto);
  }

  @Delete('users/:id')
  @Public()
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.deleteUser(id);
  }

  // ============================================================
  // ROLES CRUD - Public read for DevBoard, Admin write
  // ============================================================

  @Get('roles')
  @Public()
  findAllRoles() {
    return this.crudService.findAllRoles();
  }

  @Get('roles/:id')
  @Public()
  findOneRole(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.findOneRole(id);
  }

  @Post('roles')
  @Public()
  createRole(@Body() dto: CreateRoleDto) {
    return this.crudService.createRole(dto);
  }

  @Put('roles/:id')
  @Public()
  updateRole(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.crudService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  @Public()
  deleteRole(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.deleteRole(id);
  }

  // ============================================================
  // MENUS CRUD - Public read, Admin write
  // ============================================================

  @Get('menus')
  @Public()
  findAllMenus(@Query() query: PaginationDto) {
    return this.crudService.findAllMenus(query);
  }

  @Get('menus/:id')
  @Public()
  findOneMenu(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.findOneMenu(id);
  }

  @Post('menus')
  @Public()
  createMenu(@Body() dto: CreateMenuDto) {
    return this.crudService.createMenu(dto);
  }

  @Put('menus/:id')
  @Public()
  updateMenu(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMenuDto) {
    return this.crudService.updateMenu(id, dto);
  }

  @Delete('menus/:id')
  @Public()
  deleteMenu(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.deleteMenu(id);
  }

  // ============================================================
  // DISHES CRUD - Public read, Admin write
  // ============================================================

  @Get('dishes')
  @Public()
  findAllDishes(@Query() query: PaginationDto & { menuId?: number }) {
    return this.crudService.findAllDishes(query);
  }

  @Get('dishes/:id')
  @Public()
  findOneDish(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.findOneDish(id);
  }

  @Post('dishes')
  @Public()
  createDish(@Body() dto: CreateDishDto) {
    return this.crudService.createDish(dto);
  }

  @Put('dishes/:id')
  @Public()
  updateDish(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDishDto) {
    return this.crudService.updateDish(id, dto);
  }

  @Delete('dishes/:id')
  @Public()
  deleteDish(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.deleteDish(id);
  }

  // ============================================================
  // ALLERGENS CRUD - Public read, Admin write
  // ============================================================

  @Get('allergens')
  @Public()
  findAllAllergens() {
    return this.crudService.findAllAllergens();
  }

  @Get('allergens/:id')
  @Public()
  findOneAllergen(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.findOneAllergen(id);
  }

  @Post('allergens')
  @Public()
  createAllergen(@Body() dto: CreateLabelDto) {
    return this.crudService.createAllergen(dto);
  }

  @Put('allergens/:id')
  @Public()
  updateAllergen(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLabelDto) {
    return this.crudService.updateAllergen(id, dto);
  }

  @Delete('allergens/:id')
  @Public()
  deleteAllergen(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.deleteAllergen(id);
  }

  // ============================================================
  // DIETS CRUD - Public read, Admin write
  // ============================================================

  @Get('diets')
  @Public()
  findAllDiets() {
    return this.crudService.findAllDiets();
  }

  @Get('diets/:id')
  @Public()
  findOneDiet(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.findOneDiet(id);
  }

  @Post('diets')
  @Public()
  createDiet(@Body() dto: CreateLabelDto) {
    return this.crudService.createDiet(dto);
  }

  @Put('diets/:id')
  @Public()
  updateDiet(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLabelDto) {
    return this.crudService.updateDiet(id, dto);
  }

  @Delete('diets/:id')
  @Public()
  deleteDiet(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.deleteDiet(id);
  }

  // ============================================================
  // THEMES CRUD - Public read, Admin write
  // ============================================================

  @Get('themes')
  @Public()
  findAllThemes() {
    return this.crudService.findAllThemes();
  }

  @Get('themes/:id')
  @Public()
  findOneTheme(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.findOneTheme(id);
  }

  @Post('themes')
  @Public()
  createTheme(@Body() dto: CreateLabelDto) {
    return this.crudService.createTheme(dto);
  }

  @Put('themes/:id')
  @Public()
  updateTheme(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLabelDto) {
    return this.crudService.updateTheme(id, dto);
  }

  @Delete('themes/:id')
  @Public()
  deleteTheme(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.deleteTheme(id);
  }

  // ============================================================
  // ORDERS CRUD - Public read for DevBoard, Admin write
  // ============================================================

  @Get('orders')
  @Public()
  findAllOrders(@Query() query: PaginationDto & { status?: string; userId?: number }) {
    return this.crudService.findAllOrders(query);
  }

  @Get('orders/:id')
  @Public()
  findOneOrder(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.findOneOrder(id);
  }

  @Post('orders')
  @Public()
  createOrder(@Body() dto: CreateOrderDto) {
    return this.crudService.createOrder({
      ...dto,
      order_date: new Date(dto.order_date),
      prestation_date: new Date(dto.prestation_date),
    });
  }

  @Put('orders/:id')
  @Public()
  updateOrder(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderDto) {
    return this.crudService.updateOrder(id, dto);
  }

  @Delete('orders/:id')
  @Public()
  deleteOrder(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.deleteOrder(id);
  }

  // ============================================================
  // WORKING HOURS CRUD - Public read, Admin write
  // ============================================================

  @Get('working-hours')
  @Public()
  findAllWorkingHours() {
    return this.crudService.findAllWorkingHours();
  }

  @Get('working-hours/:id')
  @Public()
  findOneWorkingHours(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.findOneWorkingHours(id);
  }

  @Post('working-hours')
  @Public()
  createWorkingHours(@Body() dto: CreateWorkingHoursDto) {
    return this.crudService.createWorkingHours(dto);
  }

  @Put('working-hours/:id')
  @Public()
  updateWorkingHours(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWorkingHoursDto) {
    return this.crudService.updateWorkingHours(id, dto);
  }

  @Delete('working-hours/:id')
  @Public()
  deleteWorkingHours(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.deleteWorkingHours(id);
  }
}
