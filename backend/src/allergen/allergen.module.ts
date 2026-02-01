/**
 * Allergen Module
 * ===============
 */

import { Module } from '@nestjs/common';
import { AllergenController } from './allergen.controller';
import { AllergenService } from './allergen.service';
import { PrismaModule } from '../prisma';

@Module({
  imports: [PrismaModule],
  controllers: [AllergenController],
  providers: [AllergenService],
  exports: [AllergenService],
})
export class AllergenModule {}
