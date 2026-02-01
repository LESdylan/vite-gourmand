import { Exclude, Expose } from 'class-transformer';

/**
 * User response DTO - excludes sensitive fields like password
 */
export class UserResponseDto {
  @Expose()
  id!: number;

  @Expose()
  email!: string;

  @Expose()
  firstName!: string;

  @Expose()
  role!: string;

  @Exclude()
  password?: string;
}

export class AuthResponseDto {
  user!: {
    id: number;
    email: string;
    firstName: string;
    role: string;
  };
  accessToken!: string;
  refreshToken!: string;
}

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
  firstName: string;
}
