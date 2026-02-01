import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { VALIDATION } from '../../common/constants';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @MinLength(VALIDATION.PASSWORD_MIN_LENGTH, {
    message: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
  })
  @MaxLength(VALIDATION.PASSWORD_MAX_LENGTH, {
    message: `Password must not exceed ${VALIDATION.PASSWORD_MAX_LENGTH} characters`,
  })
  password!: string;

  @IsString()
  @MinLength(VALIDATION.NAME_MIN_LENGTH, {
    message: `First name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`,
  })
  @MaxLength(VALIDATION.NAME_MAX_LENGTH, {
    message: `First name must not exceed ${VALIDATION.NAME_MAX_LENGTH} characters`,
  })
  firstName!: string;

  @IsOptional()
  @IsString()
  @Matches(VALIDATION.PHONE_REGEX, {
    message: 'Please provide a valid French phone number',
  })
  telephoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  postalAddress?: string;
}
