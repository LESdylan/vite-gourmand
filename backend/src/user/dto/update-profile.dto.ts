import {
  IsString,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';
import { VALIDATION } from '../../common/constants';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

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
  @MaxLength(200)
  postalAddress?: string;
}
