/**
 * CRUD DTOs
 * =========
 * Data Transfer Objects for CRUD operations
 */

import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsDateString,
  MinLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============================================================
// Query DTOs
// ============================================================

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  skip?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  take?: number;

  @IsOptional()
  @IsString()
  search?: string;
}

// ============================================================
// User DTOs
// ============================================================

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  firstName!: string;

  @IsOptional()
  @IsString()
  telephoneNumber?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalAddress?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  roleId?: number;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  telephoneNumber?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalAddress?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  roleId?: number;
}

// ============================================================
// Role DTOs
// ============================================================

export class CreateRoleDto {
  @IsString()
  libelle!: string;
}

export class UpdateRoleDto {
  @IsString()
  libelle!: string;
}

// ============================================================
// Menu DTOs
// ============================================================

export class CreateMenuDto {
  @IsString()
  title!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  person_min!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price_per_person!: number;

  @IsString()
  description!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  remaining_qty!: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  dietId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  themeId?: number;
}

export class UpdateMenuDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  person_min?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price_per_person?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  remaining_qty?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  dietId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  themeId?: number;
}

// ============================================================
// Dish DTOs
// ============================================================

export class CreateDishDto {
  @IsString()
  title_dish!: string;

  @IsString()
  photo!: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  menuId?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  allergenIds?: number[];
}

export class UpdateDishDto {
  @IsOptional()
  @IsString()
  title_dish?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  menuId?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  allergenIds?: number[];
}

// ============================================================
// Simple Label DTOs (Allergen, Diet, Theme)
// ============================================================

export class CreateLabelDto {
  @IsString()
  libelle!: string;
}

export class UpdateLabelDto {
  @IsString()
  libelle!: string;
}

// ============================================================
// Order DTOs
// ============================================================

export class CreateOrderDto {
  @IsString()
  order_number!: string;

  @IsDateString()
  order_date!: string;

  @IsDateString()
  prestation_date!: string;

  @IsString()
  delivery_hour!: string;

  @IsNumber()
  @Type(() => Number)
  menu_price!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  person_number!: number;

  @IsNumber()
  @Type(() => Number)
  delivery_price!: number;

  @IsString()
  status!: string;

  @IsBoolean()
  material_lending!: boolean;

  @IsBoolean()
  get_back_material!: boolean;

  @IsNumber()
  @Type(() => Number)
  userId!: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  menuIds?: number[];
}

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  delivery_hour?: string;

  @IsOptional()
  @IsBoolean()
  material_lending?: boolean;

  @IsOptional()
  @IsBoolean()
  get_back_material?: boolean;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  menuIds?: number[];
}

// ============================================================
// Working Hours DTOs
// ============================================================

export class CreateWorkingHoursDto {
  @IsString()
  day!: string;

  @IsString()
  opening!: string;

  @IsString()
  closing!: string;
}

export class UpdateWorkingHoursDto {
  @IsOptional()
  @IsString()
  day?: string;

  @IsOptional()
  @IsString()
  opening?: string;

  @IsOptional()
  @IsString()
  closing?: string;
}
