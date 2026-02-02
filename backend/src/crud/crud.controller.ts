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
  // USERS CRUD - Admin only
  // ============================================================

  @Get('users')
  @Roles('admin')
  findAllUsers(@Query() query: PaginationDto) {
    return this.crudService.findAllUsers(query);
  }

  @Get('users/:id')
  @Roles('admin')
  findOneUser(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.findOneUser(id);
  }

  @Post('users')
  @Roles('admin')
  createUser(@Body() dto: CreateUserDto) {
    return this.crudService.createUser(dto);
  }

  @Put('users/:id')
  @Roles('admin')
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.crudService.updateUser(id, dto);
  }

  @Delete('users/:id')
  @Roles('admin')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.deleteUser(id);
  }

  // ============================================================
  // ROLES CRUD - Admin only
  // ============================================================

  @Get('roles')
  @Roles('admin')
  findAllRoles() {
    return this.crudService.findAllRoles();
  }

  @Get('roles/:id')
  @Roles('admin')
  findOneRole(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.findOneRole(id);
  }

  @Post('roles')
  @Roles('admin')
  createRole(@Body() dto: CreateRoleDto) {
    return this.crudService.createRole(dto);
  }

  @Put('roles/:id')
  @Roles('admin')
  updateRole(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.crudService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  @Roles('admin')
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
  @Roles('admin')
  createMenu(@Body() dto: CreateMenuDto) {
    return this.crudService.createMenu(dto);
  }

  @Put('menus/:id')
  @Roles('admin')
  updateMenu(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMenuDto) {
    return this.crudService.updateMenu(id, dto);
  }

  @Delete('menus/:id')
  @Roles('admin')
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
  @Roles('admin')
  createDish(@Body() dto: CreateDishDto) {
    return this.crudService.createDish(dto);
  }

  @Put('dishes/:id')
  @Roles('admin')
  updateDish(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDishDto) {
    return this.crudService.updateDish(id, dto);
  }

  @Delete('dishes/:id')
  @Roles('admin')
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
  @Roles('admin')
  createAllergen(@Body() dto: CreateLabelDto) {
    return this.crudService.createAllergen(dto);
  }

  @Put('allergens/:id')
  @Roles('admin')
  updateAllergen(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLabelDto) {
    return this.crudService.updateAllergen(id, dto);
  }

  @Delete('allergens/:id')
  @Roles('admin')
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
  @Roles('admin')
  createDiet(@Body() dto: CreateLabelDto) {
    return this.crudService.createDiet(dto);
  }

  @Put('diets/:id')
  @Roles('admin')
  updateDiet(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLabelDto) {
    return this.crudService.updateDiet(id, dto);
  }

  @Delete('diets/:id')
  @Roles('admin')
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
  @Roles('admin')
  createTheme(@Body() dto: CreateLabelDto) {
    return this.crudService.createTheme(dto);
  }

  @Put('themes/:id')
  @Roles('admin')
  updateTheme(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLabelDto) {
    return this.crudService.updateTheme(id, dto);
  }

  @Delete('themes/:id')
  @Roles('admin')
  deleteTheme(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.deleteTheme(id);
  }

  // ============================================================
  // ORDERS CRUD - Admin only
  // ============================================================

  @Get('orders')
  @Roles('admin')
  findAllOrders(@Query() query: PaginationDto & { status?: string; userId?: number }) {
    return this.crudService.findAllOrders(query);
  }

  @Get('orders/:id')
  @Roles('admin')
  findOneOrder(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.findOneOrder(id);
  }

  @Post('orders')
  @Roles('admin')
  createOrder(@Body() dto: CreateOrderDto) {
    return this.crudService.createOrder({
      ...dto,
      order_date: new Date(dto.order_date),
      prestation_date: new Date(dto.prestation_date),
    });
  }

  @Put('orders/:id')
  @Roles('admin')
  updateOrder(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderDto) {
    return this.crudService.updateOrder(id, dto);
  }

  @Delete('orders/:id')
  @Roles('admin')
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
  @Roles('admin')
  createWorkingHours(@Body() dto: CreateWorkingHoursDto) {
    return this.crudService.createWorkingHours(dto);
  }

  @Put('working-hours/:id')
  @Roles('admin')
  updateWorkingHours(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWorkingHoursDto) {
    return this.crudService.updateWorkingHours(id, dto);
  }

  @Delete('working-hours/:id')
  @Roles('admin')
  deleteWorkingHours(@Param('id', ParseIntPipe) id: number) {
    return this.crudService.deleteWorkingHours(id);
  }
}
