/**
 * User Service
 * ============
 * Business logic for user profile operations
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto';
import {
  userSelect,
  transformUserResponse,
  getAnonymizedUserData,
} from './user.helpers';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user profile by ID
   */
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return transformUserResponse(user);
  }

  /**
   * Update user profile
   */
  async update(id: number, dto: UpdateProfileDto) {
    await this.ensureUserExists(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: this.mapDtoToUserData(dto),
      select: userSelect,
    });

    return transformUserResponse(user);
  }

  /**
   * Delete user account (RGPD compliant - anonymizes data)
   */
  async remove(id: number) {
    await this.ensureUserExists(id);

    // Anonymize rather than delete to preserve order history integrity
    await this.prisma.user.update({
      where: { id },
      data: getAnonymizedUserData(),
    });

    return { message: 'Account deleted successfully' };
  }

  /**
   * Update GDPR consent
   */
  async updateGdprConsent(id: number, consent: boolean, marketing: boolean) {
    await this.ensureUserExists(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        gdprConsent: consent,
        gdprConsentDate: consent ? new Date() : null,
        marketingConsent: marketing,
      },
      select: userSelect,
    });

    return transformUserResponse(user);
  }

  /**
   * Export user data (RGPD right to data portability)
   */
  async exportData(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        orders: true,
        publishes: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.buildExportData(user);
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private async ensureUserExists(id: number): Promise<void> {
    const exists = await this.prisma.user.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  private mapDtoToUserData(dto: UpdateProfileDto) {
    return {
      first_name: dto.firstName,
      telephone_number: dto.telephoneNumber,
      city: dto.city,
      country: dto.country,
      postal_address: dto.postalAddress,
    };
  }

  private buildExportData(user: any) {
    return {
      profile: transformUserResponse(user),
      orders: user.orders.map((o: any) => ({
        orderNumber: o.order_number,
        date: o.order_date,
        status: o.status,
        total: o.menu_price + o.delivery_price,
      })),
      reviews: user.publishes.map((p: any) => ({
        note: p.note,
        description: p.description,
        status: p.status,
      })),
      exportedAt: new Date().toISOString(),
    };
  }
}
