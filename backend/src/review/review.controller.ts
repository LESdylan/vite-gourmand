/**
 * Review Controller
 * =================
 * REST API endpoints for customer reviews
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { Public, Roles, CurrentUser } from '../common';
import type { UserPayload } from '../common/decorators/current-user.decorator';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly service: ReviewService) {}

  /**
   * GET /api/reviews - Get approved reviews (public)
   */
  @Public()
  @Get()
  findApproved(@Query() query: { page?: number; limit?: number }) {
    return this.service.findApproved(query);
  }

  /**
   * GET /api/reviews/me - Get user's reviews
   */
  @Get('me')
  findUserReviews(@CurrentUser() user: UserPayload) {
    return this.service.findUserReviews(user.id);
  }

  /**
   * POST /api/reviews - Create review
   */
  @Post()
  create(
    @Body() dto: { note: string; description: string },
    @CurrentUser() user: UserPayload,
  ) {
    return this.service.create(dto, user.id);
  }

  /**
   * PATCH /api/reviews/:id/status - Update review status (admin)
   */
  @Roles('admin')
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.service.updateStatus(id, status);
  }

  /**
   * DELETE /api/reviews/:id - Delete review
   */
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.role === 'admin' ? undefined : user.id;
    return this.service.remove(id, userId);
  }
}
