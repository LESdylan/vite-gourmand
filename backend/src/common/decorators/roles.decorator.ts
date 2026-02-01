import { SetMetadata } from '@nestjs/common';
import { METADATA_KEYS, Role } from '../constants';

/**
 * Sets required roles for a route
 * Use @Roles('admin', 'chef') decorator on controller methods
 */
export const ROLES_KEY = METADATA_KEYS.ROLES;
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
