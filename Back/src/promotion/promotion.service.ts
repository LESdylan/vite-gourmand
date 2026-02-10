/**
 * Promotion Service
 * Manages promotions, publicity banners, and user-targeted offers.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { PaginationDto, buildPaginationMeta } from '../common';

@Injectable()
export class PromotionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * PUBLIC: Get currently active public promotions (banners / publicity).
   * Only returns promotions that are:
   *   - active
   *   - public
   *   - within their start_date / end_date window
   * Ordered by priority DESC (highest first).
   */
  async getActivePublic() {
    const now = new Date();

    return this.prisma.promotion.findMany({
      where: {
        is_active: true,
        is_public: true,
        start_date: { lte: now },
        OR: [{ end_date: null }, { end_date: { gte: now } }],
      },
      orderBy: { priority: 'desc' },
      include: {
        Discount: {
          select: { code: true, type: true, value: true },
        },
      },
    });
  }

  /**
   * ADMIN: List all promotions (paginated, optional active filter).
   */
  async findAll(pagination: PaginationDto, activeOnly?: boolean) {
    const { page = 1, limit = 20 } = pagination;
    const where = activeOnly !== undefined ? { is_active: activeOnly } : {};

    const [items, total] = await Promise.all([
      this.prisma.promotion.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ priority: 'desc' }, { created_at: 'desc' }],
        include: {
          Discount: { select: { code: true, type: true, value: true } },
          User: { select: { first_name: true } },
        },
      }),
      this.prisma.promotion.count({ where }),
    ]);

    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  /**
   * ADMIN: Get single promotion by ID.
   */
  async findById(id: number) {
    const promo = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        Discount: true,
        User: { select: { first_name: true, email: true } },
        UserPromotion: {
          include: {
            User: { select: { id: true, first_name: true, email: true } },
          },
        },
      },
    });
    if (!promo) throw new NotFoundException('Promotion not found');
    return promo;
  }

  /**
   * ADMIN: Create a new promotion.
   */
  async create(dto: CreatePromotionDto, createdBy: number) {
    return this.prisma.promotion.create({
      data: {
        title: dto.title,
        description: dto.description,
        short_text: dto.short_text,
        type: dto.type,
        image_url: dto.image_url,
        link_url: dto.link_url,
        link_label: dto.link_label,
        badge_text: dto.badge_text,
        bg_color: dto.bg_color ?? '#722F37',
        text_color: dto.text_color ?? '#FFFFFF',
        discount_id: dto.discount_id,
        priority: dto.priority ?? 0,
        is_active: dto.is_active ?? true,
        is_public: dto.is_public ?? true,
        start_date: new Date(dto.start_date),
        end_date: dto.end_date ? new Date(dto.end_date) : null,
        created_by: createdBy,
      },
    });
  }

  /**
   * ADMIN: Update a promotion.
   */
  async update(id: number, dto: UpdatePromotionDto) {
    await this.ensureExists(id);

    const data: Record<string, unknown> = { ...dto, updated_at: new Date() };
    if (dto.start_date) data.start_date = new Date(dto.start_date);
    if (dto.end_date) data.end_date = new Date(dto.end_date);

    return this.prisma.promotion.update({ where: { id }, data });
  }

  /**
   * ADMIN: Delete a promotion.
   */
  async delete(id: number) {
    await this.ensureExists(id);
    return this.prisma.promotion.delete({ where: { id } });
  }

  /**
   * ADMIN: Assign a promotion to a specific user.
   */
  async assignToUser(promotionId: number, userId: number) {
    await this.ensureExists(promotionId);

    return this.prisma.userPromotion.upsert({
      where: {
        user_id_promotion_id: { user_id: userId, promotion_id: promotionId },
      },
      create: { user_id: userId, promotion_id: promotionId },
      update: {},
    });
  }

  /**
   * AUTH: Get promotions assigned to the current user (personal offers).
   */
  async getUserPromotions(userId: number) {
    const now = new Date();

    return this.prisma.userPromotion.findMany({
      where: {
        user_id: userId,
        is_used: false,
        Promotion: {
          is_active: true,
          start_date: { lte: now },
          OR: [{ end_date: null }, { end_date: { gte: now } }],
        },
      },
      include: {
        Promotion: {
          include: {
            Discount: { select: { code: true, type: true, value: true } },
          },
        },
      },
      orderBy: { assigned_at: 'desc' },
    });
  }

  /**
   * AUTH: Mark a user promotion as seen.
   */
  async markSeen(userId: number, promotionId: number) {
    return this.prisma.userPromotion.updateMany({
      where: { user_id: userId, promotion_id: promotionId },
      data: { is_seen: true },
    });
  }

  /**
   * AUTH: Mark a user promotion as used.
   */
  async markUsed(userId: number, promotionId: number) {
    return this.prisma.userPromotion.updateMany({
      where: { user_id: userId, promotion_id: promotionId },
      data: { is_used: true, used_at: new Date() },
    });
  }

  private async ensureExists(id: number) {
    const promo = await this.prisma.promotion.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException('Promotion not found');
    return promo;
  }
}
