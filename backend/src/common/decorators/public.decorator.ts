import { SetMetadata } from '@nestjs/common';
import { METADATA_KEYS } from '../constants';

/**
 * Marks a route as public (no authentication required)
 * Use @Public() decorator on controller methods to skip JWT auth
 */
export const IS_PUBLIC_KEY = METADATA_KEYS.IS_PUBLIC;
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
