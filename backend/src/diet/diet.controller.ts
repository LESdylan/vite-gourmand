/**
 * Diet Controller
 * ===============
 * REST API endpoints for dietary preferences
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
import { DietService } from './diet.service';
import { Public, Roles } from '../common';

@Controller('diets')
export class DietController {
  constructor(private readonly service: DietService) {}

  /**
   * GET /api/diets - Get all diets (public)
   */
  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /**
   * POST /api/diets - Create diet (admin)
   */
  @Roles('admin')
  @Post()
  create(@Body('name') name: string) {
    return this.service.create(name);
  }

  /**
   * PUT /api/diets/:id - Update diet (admin)
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
   * DELETE /api/diets/:id - Delete diet (admin)
   */
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
