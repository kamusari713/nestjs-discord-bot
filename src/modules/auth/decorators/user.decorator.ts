import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'src/modules/auth/types/request.type';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest<Request>().user;
  },
);
