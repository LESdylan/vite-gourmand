/**
 * Image Service
 */
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateMenuImageDto, UpdateMenuImageDto, CreateReviewImageDto, UpdateReviewImageDto } from './dto/image.dto';

@Injectable()
export class ImageService {
  constructor(private prisma: PrismaService) {}

  // ============ Menu Images ============

  /**
   * Get all images for a menu item
   */
  async getMenuItemImages(menuItemId: number) {
    return this.prisma.menuImage.findMany({
      where: { menu_item_id: menuItemId },
      orderBy: [{ is_primary: 'desc' }, { display_order: 'asc' }],
    });
  }

  /**
   * Get menu image by ID
   */
  async getMenuImageById(id: number) {
    const image = await this.prisma.menuImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Menu image not found');
    }

    return image;
  }

  /**
   * Create menu image
   */
  async createMenuImage(dto: CreateMenuImageDto) {
    // Verify menu item exists
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: dto.menu_item_id },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    // If this is primary, unset other primary images
    if (dto.is_primary) {
      await this.prisma.menuImage.updateMany({
        where: { menu_item_id: dto.menu_item_id, is_primary: true },
        data: { is_primary: false },
      });
    }

    return this.prisma.menuImage.create({
      data: {
        menu_item_id: dto.menu_item_id,
        image_url: dto.image_url,
        alt_text: dto.alt_text,
        is_primary: dto.is_primary ?? false,
        display_order: dto.display_order ?? 0,
      },
    });
  }

  /**
   * Update menu image
   */
  async updateMenuImage(id: number, dto: UpdateMenuImageDto) {
    const image = await this.prisma.menuImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Menu image not found');
    }

    // If setting as primary, unset other primary images
    if (dto.is_primary) {
      await this.prisma.menuImage.updateMany({
        where: {
          menu_item_id: image.menu_item_id,
          is_primary: true,
          id: { not: id },
        },
        data: { is_primary: false },
      });
    }

    return this.prisma.menuImage.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Set image as primary
   */
  async setMenuImageAsPrimary(id: number) {
    const image = await this.prisma.menuImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Menu image not found');
    }

    // Unset other primary images
    await this.prisma.menuImage.updateMany({
      where: { menu_item_id: image.menu_item_id, is_primary: true },
      data: { is_primary: false },
    });

    return this.prisma.menuImage.update({
      where: { id },
      data: { is_primary: true },
    });
  }

  /**
   * Delete menu image
   */
  async deleteMenuImage(id: number) {
    const image = await this.prisma.menuImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Menu image not found');
    }

    return this.prisma.menuImage.delete({
      where: { id },
    });
  }

  /**
   * Reorder menu images
   */
  async reorderMenuImages(menuItemId: number, imageIds: number[]) {
    const updates = imageIds.map((imageId, index) =>
      this.prisma.menuImage.update({
        where: { id: imageId },
        data: { display_order: index },
      }),
    );

    await this.prisma.$transaction(updates);
    return this.getMenuItemImages(menuItemId);
  }

  // ============ Review Images ============

  /**
   * Get all images for a review
   */
  async getReviewImages(reviewId: number) {
    return this.prisma.reviewImage.findMany({
      where: { review_id: reviewId },
      orderBy: { display_order: 'asc' },
    });
  }

  /**
   * Get review image by ID
   */
  async getReviewImageById(id: number) {
    const image = await this.prisma.reviewImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Review image not found');
    }

    return image;
  }

  /**
   * Create review image
   */
  async createReviewImage(dto: CreateReviewImageDto, userId: number) {
    // Verify review exists and belongs to user
    const review = await this.prisma.review.findUnique({
      where: { id: dto.review_id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.user_id !== userId) {
      throw new ForbiddenException('You can only add images to your own reviews');
    }

    // Count existing images (limit to 5)
    const existingCount = await this.prisma.reviewImage.count({
      where: { review_id: dto.review_id },
    });

    if (existingCount >= 5) {
      throw new BadRequestException('Maximum 5 images per review');
    }

    return this.prisma.reviewImage.create({
      data: {
        review_id: dto.review_id,
        image_url: dto.image_url,
        alt_text: dto.alt_text,
        display_order: dto.display_order ?? existingCount,
      },
    });
  }

  /**
   * Create review image (admin)
   */
  async createReviewImageAdmin(dto: CreateReviewImageDto) {
    // Verify review exists
    const review = await this.prisma.review.findUnique({
      where: { id: dto.review_id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.prisma.reviewImage.create({
      data: {
        review_id: dto.review_id,
        image_url: dto.image_url,
        alt_text: dto.alt_text,
        display_order: dto.display_order ?? 0,
      },
    });
  }

  /**
   * Update review image
   */
  async updateReviewImage(id: number, dto: UpdateReviewImageDto, userId: number) {
    const image = await this.prisma.reviewImage.findUnique({
      where: { id },
      include: { review: true },
    });

    if (!image) {
      throw new NotFoundException('Review image not found');
    }

    if (image.review.user_id !== userId) {
      throw new ForbiddenException('You can only modify images on your own reviews');
    }

    return this.prisma.reviewImage.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Delete review image
   */
  async deleteReviewImage(id: number, userId: number) {
    const image = await this.prisma.reviewImage.findUnique({
      where: { id },
      include: { review: true },
    });

    if (!image) {
      throw new NotFoundException('Review image not found');
    }

    if (image.review.user_id !== userId) {
      throw new ForbiddenException('You can only delete images on your own reviews');
    }

    return this.prisma.reviewImage.delete({
      where: { id },
    });
  }

  /**
   * Delete review image (admin)
   */
  async deleteReviewImageAdmin(id: number) {
    const image = await this.prisma.reviewImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Review image not found');
    }

    return this.prisma.reviewImage.delete({
      where: { id },
    });
  }
}
