/**
 * Validation Pipe Unit Tests
 */
import { BadRequestException } from '@nestjs/common';
import { CustomValidationPipe } from '../common/pipes/validation.pipe';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

// Test DTO
class TestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;
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
    const validData = { name: 'John', email: 'john@example.com' };
    const result = await pipe.transform(validData, {
      metatype: TestDto,
      type: 'body',
    });

    expect(result).toEqual(validData);
  });

  it('should throw BadRequestException for invalid data', async () => {
    const invalidData = { name: '', email: 'invalid-email' };

    await expect(
      pipe.transform(invalidData, { metatype: TestDto, type: 'body' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should pass primitive types without validation', async () => {
    const data = 'test string';
    const result = await pipe.transform(data, {
      metatype: String,
      type: 'body',
    });

    expect(result).toBe(data);
  });

  it('should pass when no metatype', async () => {
    const data = { any: 'data' };
    const result = await pipe.transform(data, {
      metatype: undefined,
      type: 'body',
    });

    expect(result).toEqual(data);
  });
});
