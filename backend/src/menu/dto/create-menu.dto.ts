import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
  IsPositive,
} from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @MaxLength(100)
  title!: string;

  @IsNumber()
  @Min(1)
  personMin!: number;

  @IsNumber()
  @IsPositive()
  pricePerPerson!: number;

  @IsString()
  @MaxLength(500)
  description!: string;

  @IsNumber()
  @Min(0)
  remainingQty!: number;

  @IsOptional()
  @IsNumber()
  dietId?: number;

  @IsOptional()
  @IsNumber()
  themeId?: number;
}
