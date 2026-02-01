/**
 * Allergen Controller
 * ===================
 * REST API endpoints for allergen information
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AllergenService } from './allergen.service';
import { Public, Roles } from '../common';

@Controller('allergens')
export class AllergenController {
  constructor(private readonly service: AllergenService) {}

  /**
   * GET /api/allergens - Get all allergens (public)
   */
  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /**
   * GET /api/allergens/:id - Get allergen with dishes (public)
   */
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /**
   * POST /api/allergens - Create allergen (admin)
   */
  @Roles('admin')
  @Post()
  create(@Body('name') name: string) {
    return this.service.create(name);
  }

  /**
   * PUT /api/allergens/:id - Update allergen (admin)
   */
  @Roles('admin')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body('name') name: string,
  ) {
    return this.service.update(id, name);
  }

  /**
   * DELETE /api/allergens/:id - Delete allergen (admin)
   */
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
