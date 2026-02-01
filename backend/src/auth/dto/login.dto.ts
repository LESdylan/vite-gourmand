import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { VALIDATION } from '../../common/constants';

export class LoginDto {
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
}
