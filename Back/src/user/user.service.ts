/**
 * User Service
 * Core user management logic
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { PaginationDto, buildPaginationMeta, PaginatedResponse } from '../common';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id, is_deleted: false },
      include: { Role: true, LoyaltyAccount: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponse<unknown>> {
    const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { is_deleted: false },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { Role: true },
      }),
      this.prisma.user.count({ where: { is_deleted: false } }),
    ]);

    return {
      items: users.map((u) => this.sanitize(u)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async update(id: number, dto: UpdateProfileDto) {
    await this.ensureExists(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: this.mapDtoToData(dto),
      include: { Role: true },
    });
    return this.sanitize(user);
  }

  async softDelete(id: number) {
    await this.ensureExists(id);
    await this.prisma.user.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date() },
    });
    return { message: 'Account deleted successfully' };
  }

  private async ensureExists(id: number): Promise<void> {
    const exists = await this.prisma.user.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('User not found');
  }

  private mapDtoToData(dto: UpdateProfileDto) {
    return {
      first_name: dto.firstName,
      last_name: dto.lastName,
      phone_number: dto.phoneNumber,
      city: dto.city,
      postal_code: dto.postalCode,
      country: dto.country,
      preferred_language: dto.preferredLanguage,
    };
  }

  private sanitize(user: {
    id: number;
    email: string;
    first_name: string;
    last_name?: string | null;
    phone_number?: string | null;
    city?: string | null;
    Role?: { name: string } | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phoneNumber: user.phone_number,
      city: user.city,
      role: user.Role?.name ?? 'client',
    };
  }
}
