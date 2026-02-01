/**
 * Review (Publish) Service
 * ========================
 * Business logic for customer reviews
 */

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateReviewDto {
  note: string;
  description: string;
}

interface ReviewQueryDto {
  page?: number;
  limit?: number;
  status?: string;
}

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all approved reviews (public)
   */
  async findApproved(query: ReviewQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [reviews, total] = await Promise.all([
      this.prisma.publish.findMany({
        where: { status: 'approved' },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { first_name: true } } },
        orderBy: { id: 'desc' },
      }),
      this.prisma.publish.count({ where: { status: 'approved' } }),
    ]);

    return {
      data: reviews.map(this.transformReview),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get user's reviews
   */
  async findUserReviews(userId: number) {
    const reviews = await this.prisma.publish.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });

    return reviews.map(this.transformReview);
  }

  /**
   * Create new review
   */
  async create(dto: CreateReviewDto, userId: number) {
    const review = await this.prisma.publish.create({
      data: {
        note: dto.note,
        description: dto.description,
        status: 'pending',
        userId,
      },
      include: { user: { select: { first_name: true } } },
    });

    return this.transformReview(review);
  }

  /**
   * Update review status (admin)
   */
  async updateStatus(id: number, status: string) {
    await this.ensureExists(id);

    const review = await this.prisma.publish.update({
      where: { id },
      data: { status },
      include: { user: { select: { first_name: true } } },
    });

    return this.transformReview(review);
  }

  /**
   * Delete review
   */
  async remove(id: number, userId?: number) {
    const review = await this.ensureExists(id);

    if (userId && review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.publish.delete({ where: { id } });
    return { message: 'Review deleted successfully' };
  }

  private transformReview(review: any) {
    return {
      id: review.id,
      note: review.note,
      description: review.description,
      status: review.status,
      author: review.user?.first_name ?? 'Anonymous',
    };
  }

  private async ensureExists(id: number) {
    const review = await this.prisma.publish.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return review;
  }
}
