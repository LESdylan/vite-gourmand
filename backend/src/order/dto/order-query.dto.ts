import { IsOptional, IsNumber, IsString, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ORDER_STATUSES } from './update-order-status.dto';

export class OrderQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsIn(ORDER_STATUSES)
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId?: number;
}
