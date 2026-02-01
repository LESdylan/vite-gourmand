/**
 * Working Hours Controller
 * ========================
 * REST API endpoints for restaurant hours
 */

import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { WorkingHoursService } from './working-hours.service';
import { Public, Roles } from '../common';

@Controller('working-hours')
export class WorkingHoursController {
  constructor(private readonly service: WorkingHoursService) {}

  /**
   * GET /api/working-hours - Get all working hours (public)
   */
  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /**
   * PUT /api/working-hours/:id - Update working hours (admin only)
   */
  @Roles('admin')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { day: string; opening: string; closing: string },
  ) {
    return this.service.update(id, dto);
  }

  /**
   * POST /api/working-hours - Create working hours (admin only)
   */
  @Roles('admin')
  @Post()
  create(@Body() dto: { day: string; opening: string; closing: string }) {
    return this.service.create(dto);
  }
}
