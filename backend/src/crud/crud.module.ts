/**
 * CRUD Module
 * ===========
 * Full CRUD operations for all entities
 * Admin-only access for most operations
 */

import { Module } from '@nestjs/common';
import { CrudController } from './crud.controller';
import { CrudService } from './crud.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CrudController],
  providers: [CrudService],
  exports: [CrudService],
})
export class CrudModule {}
