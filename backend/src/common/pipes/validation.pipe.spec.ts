import { CustomValidationPipe } from './validation.pipe';
import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { IsString, IsEmail, MinLength } from 'class-validator';

class TestDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

describe('CustomValidationPipe', () => {
  let pipe: CustomValidationPipe;

  beforeEach(() => {
    pipe = new CustomValidationPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should pass valid data', async () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: TestDto,
      data: '',
    };

    const result = await pipe.transform(
      { email: 'test@example.com', password: 'validpass123' },
      metadata,
    );

    expect(result).toBeDefined();
    expect((result as TestDto).email).toBe('test@example.com');
  });

  it('should throw BadRequestException for invalid email', async () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: TestDto,
      data: '',
    };

    await expect(
      pipe.transform({ email: 'invalid', password: 'validpass123' }, metadata),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for short password', async () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: TestDto,
      data: '',
    };

    await expect(
      pipe.transform({ email: 'test@example.com', password: '123' }, metadata),
    ).rejects.toThrow(BadRequestException);
  });

  it('should pass through primitives', async () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: String,
      data: '',
    };

    const result = await pipe.transform('test string', metadata);
    expect(result).toBe('test string');
  });
});
