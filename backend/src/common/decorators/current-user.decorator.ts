import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Parameter decorator to extract current user from request
 * Usage: @CurrentUser() user: UserPayload
 * Usage: @CurrentUser('id') userId: number
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);

/**
 * Type for the user payload attached to requests after JWT validation
 */
export interface UserPayload {
  id: number;
  email: string;
  role: string;
  firstName: string;
}
