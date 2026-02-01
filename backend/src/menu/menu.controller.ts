/**
 * Menu Controller
 * ===============
 * REST API endpoints for menu operations
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
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto, MenuQueryDto } from './dto';
import { Public, Roles } from '../common';

@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  /**
   * GET /api/menus - List all menus (public)
   */
  @Public()
  @Get()
  findAll(@Query() query: MenuQueryDto) {
    return this.menuService.findAll(query);
  }

  /**
   * GET /api/menus/:id - Get menu details (public)
   */
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  /**
   * POST /api/menus - Create menu (admin only)
   */
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  /**
   * PUT /api/menus/:id - Update menu (admin only)
   */
  @Roles('admin')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMenuDto,
  ) {
    return this.menuService.update(id, dto);
  }

  /**
   * DELETE /api/menus/:id - Delete menu (admin only)
   */
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.remove(id);
  }
}
