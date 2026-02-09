/**
 * CRUD Module
 */
import { Module, Global } from '@nestjs/common';
import { CrudService } from './crud.service';
import { PrismaModule } from '../prisma';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [CrudService],
  exports: [CrudService],
})
export class CrudModule {}
