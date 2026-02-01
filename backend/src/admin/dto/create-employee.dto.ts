import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNumber,
  IsOptional,
  Matches,
} from 'class-validator';
import { VALIDATION } from '../../common/constants';

export class CreateEmployeeDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(VALIDATION.PASSWORD_MIN_LENGTH)
  @MaxLength(VALIDATION.PASSWORD_MAX_LENGTH)
  password!: string;

  @IsString()
  @MinLength(VALIDATION.NAME_MIN_LENGTH)
  @MaxLength(VALIDATION.NAME_MAX_LENGTH)
  firstName!: string;

  @IsNumber()
  roleId!: number;

  @IsOptional()
  @IsString()
  @Matches(VALIDATION.PHONE_REGEX)
  telephoneNumber?: string;
}
