import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../common/interfaces';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (data) {
      return user?.[data];
    }

    return user;
  },
);
