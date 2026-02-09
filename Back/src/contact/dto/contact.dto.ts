/**
 * Contact DTOs
 */
import { IsString, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactMessageDto {
  @ApiProperty({ example: 'Question about catering' })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ example: 'I would like to know more about your services...' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @MaxLength(255)
  email!: string;
}

export class ContactMessageResponseDto {
  id!: number;
  title!: string;
  description!: string;
  email!: string;
  created_at!: Date;
}
