import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  MaxLength,
  IsUrl,
} from 'class-validator';

export class CreateDishDto {
  @IsString()
  @MaxLength(100)
  titleDish!: string;

  @IsString()
  @IsUrl()
  photo!: string;

  @IsOptional()
  @IsNumber()
  menuId?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  allergenIds?: number[];
}
