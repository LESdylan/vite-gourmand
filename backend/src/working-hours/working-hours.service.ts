/**
 * Working Hours Service
 * =====================
 * Business logic for restaurant working hours
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface UpdateHoursDto {
  day: string;
  opening: string;
  closing: string;
}

@Injectable()
export class WorkingHoursService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all working hours
   */
  async findAll() {
    const hours = await this.prisma.workingHours.findMany({
      orderBy: { id: 'asc' },
    });
    return hours.map(this.transformHours);
  }

  /**
   * Update working hours for a day
   */
  async update(id: number, dto: UpdateHoursDto) {
    await this.ensureExists(id);

    const hours = await this.prisma.workingHours.update({
      where: { id },
      data: {
        day: dto.day,
        opening: dto.opening,
        closing: dto.closing,
      },
    });

    return this.transformHours(hours);
  }

  /**
   * Create working hours entry
   */
  async create(dto: UpdateHoursDto) {
    const hours = await this.prisma.workingHours.create({
      data: {
        day: dto.day,
        opening: dto.opening,
        closing: dto.closing,
      },
    });

    return this.transformHours(hours);
  }

  private transformHours(hours: any) {
    return {
      id: hours.id,
      day: hours.day,
      opening: hours.opening,
      closing: hours.closing,
      isOpen: hours.opening !== 'closed',
    };
  }

  private async ensureExists(id: number): Promise<void> {
    const exists = await this.prisma.workingHours.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Working hours with ID ${id} not found`);
    }
  }
}
