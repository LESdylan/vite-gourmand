/**
 * Theme Controller
 * ================
 * REST API endpoints for menu themes
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
import { ThemeService } from './theme.service';
import { Public, Roles } from '../common';

@Controller('themes')
export class ThemeController {
  constructor(private readonly service: ThemeService) {}

  /**
   * GET /api/themes - Get all themes (public)
   */
  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /**
   * POST /api/themes - Create theme (admin)
   */
  @Roles('admin')
  @Post()
  create(@Body('name') name: string) {
    return this.service.create(name);
  }

  /**
   * PUT /api/themes/:id - Update theme (admin)
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
   * DELETE /api/themes/:id - Delete theme (admin)
   */
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
