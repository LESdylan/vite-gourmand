/**
 * Diet Service
 * ============
 * Business logic for dietary preferences
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DietService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all diets
   */
  async findAll() {
    const diets = await this.prisma.diet.findMany({
      include: { _count: { select: { menus: true } } },
    });

    return diets.map((d) => ({
      id: d.id,
      name: d.libelle,
      menuCount: d._count.menus,
    }));
  }

  /**
   * Create new diet (admin)
   */
  async create(name: string) {
    const diet = await this.prisma.diet.create({
      data: { libelle: name },
    });

    return { id: diet.id, name: diet.libelle };
  }

  /**
   * Update diet (admin)
   */
  async update(id: number, name: string) {
    await this.ensureExists(id);

    const diet = await this.prisma.diet.update({
      where: { id },
      data: { libelle: name },
    });

    return { id: diet.id, name: diet.libelle };
  }

  /**
   * Delete diet (admin)
   */
  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.diet.delete({ where: { id } });
    return { message: 'Diet deleted successfully' };
  }

  private async ensureExists(id: number): Promise<void> {
    const exists = await this.prisma.diet.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Diet with ID ${id} not found`);
    }
  }
}
