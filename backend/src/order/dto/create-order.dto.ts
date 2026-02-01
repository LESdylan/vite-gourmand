import {
  IsNumber,
  IsString,
  IsBoolean,
  IsDateString,
  IsArray,
  ArrayMinSize,
  Min,
  Matches,
} from 'class-validator';

export class CreateOrderDto {
  @IsDateString()
  prestationDate!: string;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Delivery hour must be in HH:MM format',
  })
  deliveryHour!: string;

  @IsNumber()
  @Min(1)
  personNumber!: number;

  @IsBoolean()
  materialLending!: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  menuIds!: number[];
}
