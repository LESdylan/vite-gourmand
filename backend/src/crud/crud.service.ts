/**
 * CRUD Service
 * ============
 * Generic CRUD operations for all entities
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

@Injectable()
export class CrudService {
  private readonly SALT_ROUNDS = 12;

  constructor(private prisma: PrismaService) {}

  // ============================================================
  // USER CRUD
  // ============================================================

  async findAllUsers(options?: { skip?: number; take?: number; search?: string }) {
    const where = options?.search
      ? {
          OR: [
            { email: { contains: options.search, mode: 'insensitive' as const } },
            { first_name: { contains: options.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: options?.skip || 0,
        take: options?.take || 50,
        include: { role: true },
        orderBy: { id: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(this.transformUser),
      total,
      page: Math.floor((options?.skip || 0) / (options?.take || 50)) + 1,
      pageSize: options?.take || 50,
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
      firstName: user.first_name,
      telephoneNumber: user.telephone_number,
      city: user.city,
      country: user.country,
      postalAddress: user.postal_address,
      role: user.role?.libelle || 'client',
      roleId: user.roleId,
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

    const [menus, total] = await Promise.all([
      this.prisma.menu.findMany({
        where,
        skip: options?.skip || 0,
        take: options?.take || 50,
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
    if (options?.menuId) where.menuId = options.menuId;

    const [dishes, total] = await Promise.all([
      this.prisma.dish.findMany({
        where,
        skip: options?.skip || 0,
        take: options?.take || 50,
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
    if (options?.userId) where.userId = options.userId;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: options?.skip || 0,
        take: options?.take || 50,
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
