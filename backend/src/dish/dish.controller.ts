/**
 * Dish Controller
 * ===============
 * REST API endpoints for dish operations
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
import { DishService } from './dish.service';
import { CreateDishDto, UpdateDishDto, DishQueryDto } from './dto';
import { Public, Roles } from '../common';

@Controller('dishes')
export class DishController {
  constructor(private readonly dishService: DishService) {}

  /**
   * GET /api/dishes - List all dishes (public)
   */
  @Public()
  @Get()
  findAll(@Query() query: DishQueryDto) {
    return this.dishService.findAll(query);
  }

  /**
   * GET /api/dishes/:id - Get dish details (public)
   */
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dishService.findOne(id);
  }

  /**
   * POST /api/dishes - Create dish (admin only)
   */
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateDishDto) {
    return this.dishService.create(dto);
  }

  /**
   * PUT /api/dishes/:id - Update dish (admin only)
   */
  @Roles('admin')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDishDto,
  ) {
    return this.dishService.update(id, dto);
  }

  /**
   * DELETE /api/dishes/:id - Delete dish (admin only)
   */
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dishService.remove(id);
  }
}
