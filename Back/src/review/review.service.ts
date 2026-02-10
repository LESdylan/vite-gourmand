/**
 * Review Service
 */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateReviewDto, ModerateReviewDto } from './dto/review.dto';
import { PaginationDto, buildPaginationMeta } from '../common';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Public review statistics: average rating, total approved count,
   * satisfaction percentage (reviews with note >= 4).
   */
  async getPublicStats() {
    const [aggregation, satisfiedCount, totalApproved] = await Promise.all([
      this.prisma.publish.aggregate({
        where: { status: 'approved' },
        _avg: { note: true },
        _count: { id: true },
      }),
      this.prisma.publish.count({
        where: { status: 'approved', note: { gte: 4 } },
      }),
      this.prisma.publish.count({
        where: { status: 'approved' },
      }),
    ]);

    const averageRating = aggregation._avg.note
      ? Math.round(aggregation._avg.note * 10) / 10
      : 0;
    const reviewCount = aggregation._count.id;
    const satisfactionPercent =
      totalApproved > 0 ? Math.round((satisfiedCount / totalApproved) * 100) : 0;

    return { averageRating, reviewCount, satisfactionPercent };
  }

  async findApproved(pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const where = { status: 'approved' };

    const [reviews, total] = await Promise.all([
      this.prisma.publish.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          User_Publish_user_idToUser: { select: { first_name: true } },
        },
      }),
      this.prisma.publish.count({ where }),
    ]);

    return { items: reviews, meta: buildPaginationMeta(page, limit, total) };
  }

  async findPending(pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const where = { status: 'pending' };

    const [reviews, total] = await Promise.all([
      this.prisma.publish.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'asc' },
        include: {
          User_Publish_user_idToUser: {
            select: { first_name: true, email: true },
          },
        },
      }),
      this.prisma.publish.count({ where }),
    ]);

    return { items: reviews, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: number) {
    const review = await this.prisma.publish.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async create(userId: number, dto: CreateReviewDto) {
    this.validateNote(dto.note);
    return this.prisma.publish.create({
      data: {
        user_id: userId,
        order_id: dto.orderId,
        note: dto.note,
        description: dto.description,
        status: 'pending',
      },
    });
  }

  async moderate(id: number, moderatorId: number, dto: ModerateReviewDto) {
    await this.ensureExists(id);
    return this.prisma.publish.update({
      where: { id },
      data: {
        status: dto.status,
        moderated_by: moderatorId,
        moderated_at: new Date(),
      },
    });
  }

  private validateNote(note: number) {
    if (note < 1 || note > 5) {
      throw new BadRequestException('Note must be between 1 and 5');
    }
  }

  private async ensureExists(id: number) {
    const exists = await this.prisma.publish.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Review not found');
  }
}
