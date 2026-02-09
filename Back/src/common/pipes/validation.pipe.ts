/**
 * Custom Validation Pipe
 * Validates DTOs and transforms input
 */
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

interface ValidationError {
  field: string;
  errors: string[];
}

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  async transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    const { metatype } = metadata;

    if (!metatype || !this.shouldValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Validation failed',
        error: 'Validation failed',
        details: this.formatErrors(errors),
      });
    }

    return object;
  }

  private shouldValidate(metatype: unknown): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype as typeof String);
  }

  private formatErrors(
    errors: { property: string; constraints?: Record<string, string> }[],
  ): ValidationError[] {
    return errors.map((error) => ({
      field: error.property,
      errors: Object.values(error.constraints ?? {}),
    }));
  }
}
