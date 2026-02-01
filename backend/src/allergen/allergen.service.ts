/**
 * Allergen Service
 * ================
 * Business logic for allergen information
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AllergenService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all allergens
   */
  async findAll() {
    const allergens = await this.prisma.allergen.findMany({
      include: { _count: { select: { dishes: true } } },
    });

    return allergens.map((a) => ({
      id: a.id,
      name: a.libelle,
      dishCount: a._count.dishes,
    }));
  }

  /**
   * Get allergen by ID with dishes
   */
  async findOne(id: number) {
    const allergen = await this.prisma.allergen.findUnique({
      where: { id },
      include: {
        dishes: {
          select: { id: true, title_dish: true, photo: true },
        },
      },
    });

    if (!allergen) {
      throw new NotFoundException(`Allergen with ID ${id} not found`);
    }

    return {
      id: allergen.id,
      name: allergen.libelle,
      dishes: allergen.dishes.map((d) => ({
        id: d.id,
        title: d.title_dish,
        photo: d.photo,
      })),
    };
  }

  /**
   * Create new allergen (admin)
   */
  async create(name: string) {
    const allergen = await this.prisma.allergen.create({
      data: { libelle: name },
    });

    return { id: allergen.id, name: allergen.libelle };
  }

  /**
   * Update allergen (admin)
   */
  async update(id: number, name: string) {
    await this.ensureExists(id);

    const allergen = await this.prisma.allergen.update({
      where: { id },
      data: { libelle: name },
    });

    return { id: allergen.id, name: allergen.libelle };
  }

  /**
   * Delete allergen (admin)
   */
  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.allergen.delete({ where: { id } });
    return { message: 'Allergen deleted successfully' };
  }

  private async ensureExists(id: number): Promise<void> {
    const exists = await this.prisma.allergen.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Allergen with ID ${id} not found`);
    }
  }
}
