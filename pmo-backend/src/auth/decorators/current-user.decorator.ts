import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserProfile } from '../auth.service';

export const CurrentUser = createParamDecorator(
  (data: keyof UserProfile | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserProfile;
    return data ? user?.[data] : user;
  },
);
