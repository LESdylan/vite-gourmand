/**
 * Safe Parse Int Pipe
 * Validates integers are within PostgreSQL INT range
 */
import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';

const MAX_INT = 2147483647;
const MIN_INT = -2147483648;

@Injectable()
export class SafeParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    if (value === undefined || value === null || value === '') {
      throw new BadRequestException('Validation failed (numeric string is expected)');
    }

    // Reject non-numeric strings
    if (!/^-?\d+$/.test(value)) {
      throw new BadRequestException('Validation failed (numeric string is expected)');
    }

    const num = parseInt(value, 10);

    if (isNaN(num)) {
      throw new BadRequestException('Validation failed (numeric string is expected)');
    }

    // Check PostgreSQL INT range
    if (num > MAX_INT || num < MIN_INT) {
      throw new BadRequestException(
        `Validation failed (value must be between ${MIN_INT} and ${MAX_INT})`,
      );
    }

    return num;
  }
}
