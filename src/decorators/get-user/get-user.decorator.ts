import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { type User } from '../../../prisma/generated/client';

export const GetUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
