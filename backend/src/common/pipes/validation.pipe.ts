import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { MESSAGES } from '../constants';

/**
 * Global Validation Pipe
 * Validates all incoming request DTOs using class-validator decorators
 */
@Injectable()
export class CustomValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    const { metatype } = metadata;

    // Skip validation for primitives
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Transform plain object to class instance
    // Note: excludeExtraneousValues can be enabled for stricter RGPD compliance
    // when all DTOs use @Expose() decorators
    const object = plainToInstance(metatype, value);

    // Validate
    const errors = await validate(object, {
      whitelist: true,           // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error on extra properties
      transform: true,           // Auto-transform types
      validationError: {
        target: false,           // Don't include target in error (security)
        value: false,            // Don't include value in error (security)
      },
    });

    if (errors.length > 0) {
      const messages = this.formatErrors(errors);
      throw new BadRequestException({
        message: messages,
        error: MESSAGES.VALIDATION_ERROR,
      });
    }

    return object;
  }

  private toValidate(metatype: unknown): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype as typeof String);
  }

  /**
   * Formats validation errors into readable messages
   * Recursively handles nested objects
   */
  private formatErrors(errors: ValidationError[]): string[] {
    const messages: string[] = [];

    for (const error of errors) {
      if (error.constraints) {
        messages.push(...Object.values(error.constraints));
      }

      // Handle nested validation errors
      if (error.children && error.children.length > 0) {
        const nestedMessages = this.formatErrors(error.children);
        messages.push(...nestedMessages.map((msg) => `${error.property}.${msg}`));
      }
    }

    return messages;
  }
}
